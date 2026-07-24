import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { formatDate } from '@/lib/helpers';
import { Activity, Users, FolderKanban, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireRole('ADMINISTRATOR');
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    activeUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    recentActivity,
    userGrowth,
    taskThroughput,
  ] = await Promise.all([
    prisma.user.count({ where: { organizationId: user.organizationId, isActive: true, deletedAt: null } }),
    prisma.project.count({ where: { organizationId: user.organizationId, deletedAt: null } }),
    prisma.task.count({ where: { project: { organizationId: user.organizationId }, deletedAt: null } }),
    prisma.task.count({ where: { project: { organizationId: user.organizationId }, status: 'DONE', deletedAt: null } }),
    prisma.activityLog.findMany({
      where: { organizationId: user.organizationId, createdAt: { gte: sevenDaysAgo } },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.findMany({
      where: { organizationId: user.organizationId, createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.task.findMany({
      where: { project: { organizationId: user.organizationId }, createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const userGrowthData = userGrowth.reduce((acc, u) => {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const taskThroughputData = taskThroughput.reduce((acc, t) => {
    const key = new Date(t.createdAt).toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-text-secondary">System overview and health metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{activeUsers}</p>
                <p className="text-xs text-text-secondary">Active Users</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-light text-accent-green">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalProjects}</p>
                <p className="text-xs text-text-secondary">Active Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple-light text-accent-purple">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalTasks}</p>
                <p className="text-xs text-text-secondary">Total Tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber-light text-accent-amber">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{completionRate}%</p>
                <p className="text-xs text-text-secondary">Completion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatsChart
            data={Object.entries(userGrowthData).map(([name, value]) => ({ name, value }))}
            type="line"
            title="User Growth (30 days)"
            xKey="name"
            yKey="value"
            height={280}
          />
          <StatsChart
            data={Object.entries(taskThroughputData).map(([name, value]) => ({ name, value }))}
            type="bar"
            title="Task Throughput (30 days)"
            xKey="name"
            yKey="value"
            height={280}
          />
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Activity className="h-5 w-5 text-text-secondary" />
              Recent System Activity
            </h2>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-text-secondary">No recent activity.</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-xs font-semibold text-text-secondary">
                        {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {log.user?.firstName} {log.user?.lastName}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {log.action.toLowerCase().replace(/_/g, ' ')} on {log.entityType}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-text-tertiary">{formatDate(log.createdAt)}</span>
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
