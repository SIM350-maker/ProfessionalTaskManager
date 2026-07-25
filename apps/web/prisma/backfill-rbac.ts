/**
 * One-off, idempotent backfill for the RBAC migration. Safe to run multiple times.
 *
 * For every organization:
 *  1. Ensures its 3 system roles exist (creates them from scratch for orgs that have
 *     none at all — e.g. real signups from before this migration, which never got
 *     Role/Permission rows since only prisma/seed.ts created those).
 *  2. Retroactively grants the 3 permissions added in this migration (role:manage,
 *     project:read, task:read) to already-seeded orgs' roles, since those orgs were
 *     seeded before these permissions existed.
 * For every user with a null roleId: sets it from their legacy `role` string.
 *
 * Run with: npx tsx prisma/backfill-rbac.ts
 */
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ensureSystemRolesForOrg, pickSystemRole } from '../src/services/roles';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const NEW_PERMISSIONS: Array<{ key: string; def: { name: string; resource: string; action: string }; roles: ('admin' | 'manager' | 'member')[] }> = [
  { key: 'role:manage', def: { name: 'Role Manage', resource: 'role', action: 'manage' }, roles: ['admin'] },
  { key: 'project:read', def: { name: 'Project Read', resource: 'project', action: 'read' }, roles: ['admin', 'manager', 'member'] },
  { key: 'task:read', def: { name: 'Task Read', resource: 'task', action: 'read' }, roles: ['admin', 'manager', 'member'] },
];

async function grantIfMissing(roleId: string, permissionId: string) {
  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
  if (!existing) {
    await prisma.rolePermission.create({ data: { roleId, permissionId } });
  }
}

async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  console.log(`Found ${orgs.length} organizations`);

  for (const org of orgs) {
    const roles = await ensureSystemRolesForOrg(org.id);

    for (const { key, def, roles: grantTo } of NEW_PERMISSIONS) {
      let permission = await prisma.permission.findFirst({ where: { resource: def.resource, action: def.action } });
      if (!permission) {
        permission = await prisma.permission.create({ data: def });
      }
      for (const roleKey of grantTo) {
        await grantIfMissing(roles[roleKey].id, permission.id);
      }
    }
    console.log(`  ✓ ${org.name}: system roles ensured, new permissions granted`);
  }

  const usersWithoutRoleId = await prisma.user.findMany({
    where: { roleId: null },
    select: { id: true, role: true, organizationId: true },
  });
  console.log(`Backfilling roleId for ${usersWithoutRoleId.length} users`);

  const rolesByOrg = new Map<string, Awaited<ReturnType<typeof ensureSystemRolesForOrg>>>();
  for (const u of usersWithoutRoleId) {
    let roles = rolesByOrg.get(u.organizationId);
    if (!roles) {
      roles = await ensureSystemRolesForOrg(u.organizationId);
      rolesByOrg.set(u.organizationId, roles);
    }
    const role = pickSystemRole(roles, u.role);
    await prisma.user.update({ where: { id: u.id }, data: { roleId: role.id } });
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
