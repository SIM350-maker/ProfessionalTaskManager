import { prisma } from '@/lib/database';
import type { Role } from '@/types';

/**
 * The permission taxonomy every organization's system roles are built from.
 * Kept in one place so seed.ts, real signups (registerUser/OAuth callback), and
 * the live-data backfill script can never drift out of sync with each other.
 */
export const SYSTEM_PERMISSION_DEFS = [
  { name: 'Task Create', resource: 'task', action: 'create' },
  { name: 'Task Update', resource: 'task', action: 'update' },
  { name: 'Task Delete', resource: 'task', action: 'delete' },
  { name: 'Task Read', resource: 'task', action: 'read' },
  { name: 'Project Create', resource: 'project', action: 'create' },
  { name: 'Project Update', resource: 'project', action: 'update' },
  { name: 'Project Delete', resource: 'project', action: 'delete' },
  { name: 'Project Read', resource: 'project', action: 'read' },
  { name: 'User Read', resource: 'user', action: 'read' },
  { name: 'User Create', resource: 'user', action: 'create' },
  { name: 'User Deactivate', resource: 'user', action: 'deactivate' },
  { name: 'Report View', resource: 'report', action: 'view' },
  { name: 'Team Create', resource: 'team', action: 'create' },
  { name: 'Team Update', resource: 'team', action: 'update' },
  { name: 'Team Delete', resource: 'team', action: 'delete' },
  { name: 'Organization Read', resource: 'organization', action: 'read' },
  { name: 'Organization Update', resource: 'organization', action: 'update' },
  { name: 'Label Create', resource: 'label', action: 'create' },
  { name: 'Label Delete', resource: 'label', action: 'delete' },
  { name: 'Workflow Manage', resource: 'workflow', action: 'manage' },
  { name: 'Custom Field Manage', resource: 'customField', action: 'manage' },
  { name: 'Automation Manage', resource: 'automation', action: 'manage' },
  { name: 'Template Manage', resource: 'template', action: 'manage' },
  { name: 'Role Manage', resource: 'role', action: 'manage' },
] as const;

export const MANAGER_PERMISSION_KEYS = [
  'task:create', 'task:update', 'task:read',
  'project:create', 'project:update', 'project:read',
  'report:view', 'team:update', 'label:create',
];

export const MEMBER_PERMISSION_KEYS = ['project:read', 'task:read'];

export interface SystemRoles {
  admin: Role;
  manager: Role;
  member: Role;
}

/**
 * Ensures an organization has its three system roles (Administrator/Manager/Team
 * Member) with the standard default permission grants, creating them — and the
 * global-shaped Permission rows they reference — if they don't exist yet. Idempotent:
 * safe to call on every signup and from the seed script alike, since it checks for an
 * existing "Administrator" system role first rather than creating duplicates.
 */
export async function ensureSystemRolesForOrg(organizationId: string): Promise<SystemRoles> {
  const existingAdmin = await prisma.role.findFirst({
    where: { organizationId, name: 'Administrator', isSystem: true, deletedAt: null },
  });

  if (existingAdmin) {
    const [manager, member] = await Promise.all([
      prisma.role.findFirstOrThrow({ where: { organizationId, name: 'Manager', isSystem: true } }),
      prisma.role.findFirstOrThrow({ where: { organizationId, name: 'Team Member', isSystem: true } }),
    ]);
    return { admin: existingAdmin, manager, member };
  }

  const perms = await Promise.all(
    SYSTEM_PERMISSION_DEFS.map((p) => prisma.permission.create({ data: p })),
  );
  const permByKey = new Map(perms.map((p) => [`${p.resource}:${p.action}`, p]));

  const [admin, manager, member] = await Promise.all([
    prisma.role.create({ data: { name: 'Administrator', description: 'Full system access', organizationId, isSystem: true } }),
    prisma.role.create({ data: { name: 'Manager', description: 'Project and team management', organizationId, isSystem: true } }),
    prisma.role.create({ data: { name: 'Team Member', description: 'Task execution and collaboration', organizationId, isSystem: true } }),
  ]);

  const adminPermKeys = SYSTEM_PERMISSION_DEFS.map((p) => `${p.resource}:${p.action}`);

  await Promise.all([
    ...adminPermKeys.map((k) => prisma.rolePermission.create({ data: { roleId: admin.id, permissionId: permByKey.get(k)!.id } })),
    ...MANAGER_PERMISSION_KEYS.map((k) => prisma.rolePermission.create({ data: { roleId: manager.id, permissionId: permByKey.get(k)!.id } })),
    ...MEMBER_PERMISSION_KEYS.map((k) => prisma.rolePermission.create({ data: { roleId: member.id, permissionId: permByKey.get(k)!.id } })),
  ]);

  return { admin, manager, member };
}

/** Maps a legacy role string to the matching system role for an org whose roles already exist. */
export function pickSystemRole(roles: SystemRoles, legacyRole: string): Role {
  if (legacyRole === 'ADMINISTRATOR') return roles.admin;
  if (legacyRole === 'MANAGER') return roles.manager;
  return roles.member;
}
