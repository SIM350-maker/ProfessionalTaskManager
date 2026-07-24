import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import type { Prisma } from '@generated/prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, timeAgo } from '@/lib/helpers';
import { markNotificationRead, markAllNotificationsRead } from '@/actions';
import { PageTransition } from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import { EmptyState } from '@/components/ui/EmptyState';
import { revalidatePath } from 'next/cache';
import { NotificationsRefresh } from '@/features/notifications/NotificationsRefresh';
import { Bell, Eye, CheckCheck, Inbox, Filter } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ read?: string; sort?: string }>;
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  const where: Record<string, unknown> = { userId: user.id, deletedAt: null };
  if (params.read === 'unread') where.isRead = false;
  if (params.read === 'read') where.isRead = true;

  const orderBy: Record<string, string> = {};
  const sort = params.sort || 'createdAt_desc';
  const [sortField = 'createdAt', sortDir = 'desc'] = sort.split('_');
  orderBy[sortField] = sortDir;

  const notifications = await prisma.notification.findMany({
    where: where as Prisma.NotificationWhereInput,
    include: { actor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy,
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalCount = await prisma.notification.count({ where: { userId: user.id, deletedAt: null } });

  return (
    <PageTransition>
      <NotificationsRefresh intervalMs={20000} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-7 w-7 text-text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
            <p className="text-sm text-text-secondary">
              {totalCount} total
              {unreadCount > 0 && (
                <Badge variant="primary" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form method="GET" action="/notifications" className="flex items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <select
                name="read"
                defaultValue={params.read || ''}
                className="rounded-lg border border-border-default bg-bg-card py-2 pl-10 pr-3 text-sm text-text-primary"
              >
                <option value="">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            <select
              name="sort"
              defaultValue={params.sort || 'createdAt_desc'}
              className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
            </select>
          </form>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <form
                action={async () => {
                  'use server';
                  await markAllNotificationsRead();
                  revalidatePath('/notifications');
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              </form>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-12 w-12" />}
                title="No notifications"
                description={
                  params.read
                    ? 'No notifications match this filter.'
                    : 'You\'re all caught up!'
                }
              />
            ) : (
              <StaggerList className="space-y-2">
                {notifications.map((notification) => (
                  <StaggerItem key={notification.id}>
                    <div
                      className={`group relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
                        !notification.isRead
                          ? 'border-accent-blue/30 bg-accent-blue-light/50'
                          : 'border-border-default hover:bg-bg-hover'
                      }`}
                    >
                      {!notification.isRead && (
                        <span className="absolute left-0 top-4 h-2 w-2 rounded-full bg-accent-blue" />
                      )}
                      {notification.actor && (
                        <Avatar
                          firstName={notification.actor.firstName}
                          lastName={notification.actor.lastName}
                          avatarUrl={notification.actor.avatarUrl}
                          size="md"
                          className="mt-0.5 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm ${
                              !notification.isRead
                                ? 'font-semibold text-text-primary'
                                : 'font-medium text-text-primary'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary" title={formatDate(notification.createdAt)}>
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <form
                          action={async () => {
                            'use server';
                            await markNotificationRead(notification.id);
                            revalidatePath('/notifications');
                          }}
                          className="shrink-0"
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-text-link opacity-0 transition-all hover:bg-accent-blue-light group-hover:opacity-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Mark read
                          </button>
                        </form>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
