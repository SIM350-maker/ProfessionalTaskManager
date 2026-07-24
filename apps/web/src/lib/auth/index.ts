import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SessionUser, UserRole } from '@/types';
import { validateSession } from '@/lib/session';

/**
 * Centralised permission matrix mapping resource:action strings to the set of
 * {@link UserRole} values that are authorised to perform the operation.
 */
const PERMISSION_MATRIX: Record<string, UserRole[]> = {
  'task:create': ['ADMINISTRATOR', 'MANAGER'],
  'task:update': ['ADMINISTRATOR', 'MANAGER'],
  'task:delete': ['ADMINISTRATOR'],
  'project:create': ['ADMINISTRATOR', 'MANAGER'],
  'project:update': ['ADMINISTRATOR', 'MANAGER'],
  'project:delete': ['ADMINISTRATOR'],
  'user:read': ['ADMINISTRATOR'],
  'user:create': ['ADMINISTRATOR'],
  'user:deactivate': ['ADMINISTRATOR'],
  'organization:read': ['ADMINISTRATOR'],
  'organization:update': ['ADMINISTRATOR'],
  'report:view': ['ADMINISTRATOR', 'MANAGER'],
  'team:create': ['ADMINISTRATOR'],
  'team:update': ['ADMINISTRATOR', 'MANAGER'],
  'team:delete': ['ADMINISTRATOR'],
  'workflow:manage': ['ADMINISTRATOR', 'MANAGER'],
  'customField:manage': ['ADMINISTRATOR', 'MANAGER'],
};

/**
 * Normalises a raw role string (potentially from a database value) to a canonical
 * {@link UserRole} enum value. Falls back to `TEAM_MEMBER` when the input is
 * unrecognised or null.
 *
 * @param roleName - The raw role string, e.g. `"ADMIN"` or `"MANAGER"`.
 * @returns The corresponding canonical `UserRole`.
 */
export function getRoleFromString(roleName: string | null): UserRole {
  switch (roleName?.toUpperCase()) {
    case 'ADMINISTRATOR':
    case 'ADMIN':
      return 'ADMINISTRATOR';
    case 'MANAGER':
      return 'MANAGER';
    default:
      return 'TEAM_MEMBER';
  }
}

/**
 * Checks whether a given role is authorised for the specified permission.
 *
 * @param role - The user's current role.
 * @param permission - The permission string to check (e.g. `"task:create"`).
 * @returns `true` if the role is listed in the permission matrix for the given permission.
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const allowedRoles = PERMISSION_MATRIX[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Determines whether a user with the given role is allowed to assign tasks to others.
 *
 * @param role - The user's current role.
 * @returns `true` for administrators and managers.
 */
export function canAssignTask(role: UserRole): boolean {
  return role === 'ADMINISTRATOR' || role === 'MANAGER';
}

/**
 * Determines whether a user can edit a task. Administrators and managers can edit
 * any task; team members may only edit tasks they are assigned to.
 *
 * @param role - The user's current role.
 * @param isAssignee - Whether the user is an assignee of the task.
 * @returns `true` if the user is authorised to edit.
 */
export function canEditTask(role: UserRole, isAssignee: boolean): boolean {
  return role === 'ADMINISTRATOR' || role === 'MANAGER' || isAssignee;
}

/**
 * Determines whether a user can delete a task. Administrators may delete any task;
 * other roles may only delete tasks they created.
 *
 * @param role - The user's current role.
 * @param isCreator - Whether the user is the creator of the task.
 * @returns `true` if the user is authorised to delete.
 */
export function canDeleteTask(role: UserRole, isCreator: boolean): boolean {
  return role === 'ADMINISTRATOR' || isCreator;
}

/**
 * Retrieves the currently authenticated user by reading the `session_token` cookie
 * and validating the session against the database.
 *
 * @returns The session user object, or `null` if no valid session exists.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    const user = await validateSession(token);
    if (!user) return null;
    return { ...user, role: getRoleFromString(user.role) };
  } catch {
    return null;
  }
}

/**
 * Ensures the caller has a valid session. Redirects to the login page when
 * unauthenticated.
 *
 * @returns The authenticated session user.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

/**
 * Ensures the caller is authenticated **and** has one of the specified roles.
 * Redirects to `/dashboard` when the role requirement is not met.
 *
 * @param roles - One or more roles that are permitted access.
 * @returns The authenticated session user.
 */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect('/dashboard');
  }
  return user;
}

/**
 * Ensures the caller is authenticated **and** has the specified permission.
 * Redirects to `/dashboard` when the permission is not granted.
 *
 * @param permission - The permission string to check (e.g. `"task:create"`).
 * @returns The authenticated session user.
 */
export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    redirect('/dashboard');
  }
  return user;
}
