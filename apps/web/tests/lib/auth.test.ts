import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/database', () => ({
  prisma: {},
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

import {
  getRoleFromString,
  hasPermission,
  canAssignTask,
  canEditTask,
  canDeleteTask,
} from '@/lib/auth';

describe('getRoleFromString', () => {
  it('returns ADMINISTRATOR for ADMINISTRATOR', () => {
    expect(getRoleFromString('ADMINISTRATOR')).toBe('ADMINISTRATOR');
  });

  it('returns ADMINISTRATOR for ADMIN', () => {
    expect(getRoleFromString('ADMIN')).toBe('ADMINISTRATOR');
  });

  it('returns MANAGER for MANAGER', () => {
    expect(getRoleFromString('MANAGER')).toBe('MANAGER');
  });

  it('returns TEAM_MEMBER for TEAM_MEMBER', () => {
    expect(getRoleFromString('TEAM_MEMBER')).toBe('TEAM_MEMBER');
  });

  it('returns TEAM_MEMBER for null', () => {
    expect(getRoleFromString(null)).toBe('TEAM_MEMBER');
  });

  it('returns TEAM_MEMBER for unknown role', () => {
    expect(getRoleFromString('UNKNOWN')).toBe('TEAM_MEMBER');
  });
});

describe('hasPermission', () => {
  it('returns true for ADMINISTRATOR with task:create', () => {
    expect(hasPermission('ADMINISTRATOR', 'task:create')).toBe(true);
  });

  it('returns true for MANAGER with task:create', () => {
    expect(hasPermission('MANAGER', 'task:create')).toBe(true);
  });

  it('returns false for TEAM_MEMBER with task:create', () => {
    expect(hasPermission('TEAM_MEMBER', 'task:create')).toBe(false);
  });

  it('returns true for ADMINISTRATOR with task:delete', () => {
    expect(hasPermission('ADMINISTRATOR', 'task:delete')).toBe(true);
  });

  it('returns false for MANAGER with task:delete', () => {
    expect(hasPermission('MANAGER', 'task:delete')).toBe(false);
  });

  it('returns false for unknown permission', () => {
    expect(hasPermission('ADMINISTRATOR', 'unknown:perm')).toBe(false);
  });
});

describe('canAssignTask', () => {
  it('returns true for ADMINISTRATOR', () => {
    expect(canAssignTask('ADMINISTRATOR')).toBe(true);
  });

  it('returns true for MANAGER', () => {
    expect(canAssignTask('MANAGER')).toBe(true);
  });

  it('returns false for TEAM_MEMBER', () => {
    expect(canAssignTask('TEAM_MEMBER')).toBe(false);
  });
});

describe('canEditTask', () => {
  it('returns true for ADMINISTRATOR regardless of assignee', () => {
    expect(canEditTask('ADMINISTRATOR', false)).toBe(true);
  });

  it('returns true for MANAGER regardless of assignee', () => {
    expect(canEditTask('MANAGER', false)).toBe(true);
  });

  it('returns true for TEAM_MEMBER when isAssignee', () => {
    expect(canEditTask('TEAM_MEMBER', true)).toBe(true);
  });

  it('returns false for TEAM_MEMBER when not assignee', () => {
    expect(canEditTask('TEAM_MEMBER', false)).toBe(false);
  });
});

describe('canDeleteTask', () => {
  it('returns true for ADMINISTRATOR regardless of creator', () => {
    expect(canDeleteTask('ADMINISTRATOR', false)).toBe(true);
  });

  it('returns true for TEAM_MEMBER when isCreator', () => {
    expect(canDeleteTask('TEAM_MEMBER', true)).toBe(true);
  });

  it('returns false for TEAM_MEMBER when not creator', () => {
    expect(canDeleteTask('TEAM_MEMBER', false)).toBe(false);
  });

  it('returns false for MANAGER when not creator', () => {
    expect(canDeleteTask('MANAGER', false)).toBe(false);
  });
});

describe('PERMISSION_MATRIX', () => {
  const adminPermissions = [
    'task:create', 'task:update', 'task:delete',
    'project:create', 'project:update', 'project:delete',
    'user:read', 'user:create', 'user:deactivate',
    'organization:read', 'organization:update',
    'report:view',
    'team:create', 'team:update', 'team:delete',
  ];

  const managerPermissions = [
    'task:create', 'task:update',
    'project:create', 'project:update',
    'report:view',
    'team:update',
  ];

  it('allows ADMINISTRATOR for all required permissions', () => {
    for (const perm of adminPermissions) {
      expect(hasPermission('ADMINISTRATOR', perm)).toBe(true);
    }
  });

  it('allows MANAGER for manager-level permissions', () => {
    for (const perm of managerPermissions) {
      expect(hasPermission('MANAGER', perm)).toBe(true);
    }
  });

  it('denies MANAGER for admin-only permissions', () => {
    const adminOnly = adminPermissions.filter(p => !managerPermissions.includes(p));
    for (const perm of adminOnly) {
      expect(hasPermission('MANAGER', perm)).toBe(false);
    }
  });

  it('denies TEAM_MEMBER for all task/project/user permissions', () => {
    for (const perm of adminPermissions) {
      expect(hasPermission('TEAM_MEMBER', perm)).toBe(false);
    }
  });
});