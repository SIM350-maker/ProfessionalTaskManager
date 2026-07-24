import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import type { Prisma } from '@generated/prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/search';
import { PageTransition } from '@/components/animations/PageTransition';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, maskEmail } from '@/lib/helpers';
import { deactivateUser } from '@/actions';
import { revalidatePath } from 'next/cache';
import { Shield, Users, UserCheck, UserX, Search, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; role?: string; sort?: string; logSearch?: string }>;
}

const roleBadgeVariant: Record<string, 'primary' | 'warning' | 'default'> = {
  ADMINISTRATOR: 'primary',
  MANAGER: 'warning',
  TEAM_MEMBER: 'default',
};

const roleIcon: Record<string, typeof Shield> = {
  ADMINISTRATOR: Shield,
  MANAGER: Users,
  TEAM_MEMBER: UserCheck,
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const user = await requireRole('ADMINISTRATOR');
  const params = await searchParams;

  const where: Record<string, unknown> = { organizationId: user.organizationId };
  if (params.status === 'active') where.isActive = true;
  if (params.status === 'inactive') where.isActive = false;
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const sort = params.sort || 'createdAt_desc';
  const [sortField = 'createdAt', sortDir = 'desc'] = sort.split('_');
  orderBy[sortField] = sortDir;

  const [users, auditLogs] = await Promise.all([
    prisma.user.findMany({
      where: where as Prisma.UserWhereInput,
      orderBy,
    }),
    prisma.activityLog.findMany({
      where: { organizationId: user.organizationId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(params.logSearch ? {
        where: {
          organizationId: user.organizationId,
          OR: [
            { action: { contains: params.logSearch, mode: 'insensitive' } },
            { entityType: { contains: params.logSearch, mode: 'insensitive' } },
            { user: { firstName: { contains: params.logSearch, mode: 'insensitive' } } },
            { user: { lastName: { contains: params.logSearch, mode: 'insensitive' } } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      } : {}),
    }),
  ]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
            <p className="text-sm text-text-secondary">Manage users and audit logs</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <form method="GET" action="/admin/users" className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <SearchBar
                    name="search"
                    defaultValue={params.search}
                    placeholder="Search by name or email..."
                    className="pl-10"
                  />
                </div>
                <select
                  name="role"
                  defaultValue={params.role || ''}
                  className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
                >
                  <option value="">All Roles</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                  <option value="MANAGER">Manager</option>
                  <option value="TEAM_MEMBER">Team Member</option>
                </select>
                <select
                  name="status"
                  defaultValue={params.status || ''}
                  className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  name="sort"
                  defaultValue={params.sort || 'createdAt_desc'}
                  className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
                >
                  <option value="createdAt_desc">Newest</option>
                  <option value="createdAt_asc">Oldest</option>
                  <option value="lastLoginAt_desc">Last Login</option>
                  <option value="firstName_asc">Name A-Z</option>
                </select>
              </form>
            </div>

            {users.length === 0 ? (
              <EmptyState
                title="No users found"
                description={params.search ? 'Try a different search term or filter' : 'No users in this organization yet'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-default text-left">
                      <th className="pb-3 font-medium text-text-secondary">User</th>
                      <th className="pb-3 font-medium text-text-secondary">Email</th>
                      <th className="pb-3 font-medium text-text-secondary">Role</th>
                      <th className="pb-3 font-medium text-text-secondary">Status</th>
                      <th className="pb-3 font-medium text-text-secondary">Last Login</th>
                      <th className="pb-3 font-medium text-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const RoleIcon = roleIcon[u.role] || Shield;
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-border-default transition-colors hover:bg-bg-hover"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                firstName={u.firstName}
                                lastName={u.lastName}
                                avatarUrl={u.avatarUrl}
                                size="sm"
                                status={u.isActive ? 'online' : 'offline'}
                              />
                              <div>
                                <span className="font-medium text-text-primary">
                                  {u.firstName} {u.lastName}
                                </span>
                                {u.id === user.id && (
                                  <span className="ml-2 text-xs text-text-tertiary">(you)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-text-secondary" title={u.email}>
                              {maskEmail(u.email)}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge variant={roleBadgeVariant[u.role] || 'default'}>
                              <RoleIcon className="mr-1 inline h-3 w-3" />
                              {u.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                u.isActive
                                  ? 'bg-accent-green-light text-accent-green'
                                  : 'bg-accent-red-light text-accent-red'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.isActive ? 'bg-accent-green' : 'bg-accent-red'
                                }`}
                              />
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 text-text-secondary">
                            {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}
                          </td>
                          <td className="py-3">
                            {u.isActive && u.id !== user.id && (
                              <form
                                action={async () => {
                                  'use server';
                                  await deactivateUser(u.id);
                                  revalidatePath('/admin/users');
                                }}
                              >
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-1 text-sm font-medium text-accent-red transition-colors hover:text-accent-red-hover"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                  Deactivate
                                </button>
                              </form>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Activity className="h-5 w-5 text-text-secondary" />
                Audit Logs
              </h2>
              <form method="GET" action="/admin/users" className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    name="logSearch"
                    defaultValue={params.logSearch}
                    placeholder="Search logs..."
                    className="rounded-lg border border-border-default bg-bg-card py-2 pl-10 pr-3 text-sm text-text-primary"
                  />
                </div>
              </form>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-text-secondary">No audit logs found.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-xs font-semibold text-text-secondary">
                        {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {log.user?.firstName} {log.user?.lastName} {log.action.toLowerCase().replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {log.entityType} &middot; {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{log.entityType}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
