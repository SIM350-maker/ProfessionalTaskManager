import { prisma } from '@/lib/database';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/helpers';
import { PageTransition } from '@/components/animations/PageTransition';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { Heatmap } from '@/components/dashboard/heatmap';
import { ExportButton } from '@/components/ui/export-button';
import { getOverdueTasksReport } from '@/services/analytics';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, User, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

function exportCSV(data: Record<string, unknown>[], name: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0] ?? {});
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  window.print();
}

export default async function ReportsPage() {
  const user = await requireAuth();
  const canViewOrgReports = hasPermission(user.role, 'report:view');
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);

  if (canViewOrgReports) {
    const [overdueTasks, tasksByStatus, tasksByPriority, weeklyCompletions, userStats] = await Promise.all([
      getOverdueTasksReport(user.organizationId),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { organizationId: user.organizationId }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { project: { organizationId: user.organizationId }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.task.findMany({
        where: {
          project: { organizationId: user.organizationId },
          status: 'DONE',
          completedAt: { gte: eightWeeksAgo },
          deletedAt: null,
        },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.user.count({
        where: { organizationId: user.organizationId, isActive: true },
      }),
    ]);

    const barChartData = tasksByStatus.map((s) => ({
      name: s.status.replace(/_/g, ' '),
      value: s._count.id,
    }));

    const donutChartData = tasksByPriority.map((p) => ({
      name: p.priority,
      value: p._count.id,
    }));

    const weeklyMap = new Map<string, number>();
    for (const t of weeklyCompletions) {
      if (t.completedAt) {
        const d = new Date(t.completedAt);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1);
      }
    }
    const lineChartData = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ name: date, value: count }));

    const heatmapData = Array.from({ length: 90 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (89 - i));
      const count = weeklyCompletions.filter((t) => t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === d.toISOString().slice(0, 10)).length;
      return { date: d.toISOString().slice(0, 10), value: count };
    });

    const totalTasks = tasksByStatus.reduce((sum, s) => sum + s._count.id, 0);
    const completedTasks = tasksByStatus.find((s) => s.status === 'DONE')?._count.id ?? 0;

    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-text-secondary" />
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                <p className="text-sm text-text-secondary">Organization-wide task analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton onExport={(format) => format === 'csv' ? exportCSV([...barChartData, ...donutChartData], 'reports') : exportPDF()} />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-card p-4">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>Showing data for the last 8 weeks</span>
              <Badge variant="default">{totalTasks} tasks</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="kpi">
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-light text-accent-green">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{completedTasks}</p>
                  <p className="text-xs text-text-secondary">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card variant="kpi">
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber-light text-accent-amber">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{overdueTasks.length}</p>
                  <p className="text-xs text-text-secondary">Overdue</p>
                </div>
              </CardContent>
            </Card>
            <Card variant="kpi">
              <CardContent className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple-light text-accent-purple">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{userStats}</p>
                  <p className="text-xs text-text-secondary">Active Members</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Heatmap
            data={heatmapData}
            startDate={new Date(eightWeeksAgo)}
            endDate={now}
            title="Task Completion Heatmap"
            subtitle="Daily task completions over the last 8 weeks"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <StatsChart
              data={barChartData}
              type="bar"
              title="Tasks by Status"
              xKey="name"
              yKey="value"
              height={280}
            />
            <StatsChart
              data={donutChartData}
              type="pie"
              title="Tasks by Priority"
              dataKey="value"
              nameKey="name"
              height={280}
            />
            <StatsChart
              data={lineChartData}
              type="line"
              title="Weekly Completion Trends"
              xKey="name"
              yKey="value"
              height={280}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-text-secondary" />
                  <h2 className="text-lg font-semibold text-text-primary">Tasks by Status</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasksByStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <StatusBadge status={s.status} dot />
                      <span className="text-lg font-semibold text-text-primary">{s._count.id}</span>
                    </div>
                  ))}
                  {tasksByStatus.length === 0 && (
                    <p className="text-sm text-text-secondary">No data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent-red" />
                  <h2 className="text-lg font-semibold text-accent-red">Overdue Tasks</h2>
                </div>
              </CardHeader>
              <CardContent>
                {overdueTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle className="mb-2 h-8 w-8 text-accent-green" />
                    <p className="text-sm font-medium text-text-primary">No overdue tasks</p>
                    <p className="text-xs text-text-secondary">All tasks are on track</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueTasks.slice(0, 10).map((task) => (
                      <div key={task.id} className="border-b border-border-default pb-2 last:border-0">
                        <p className="text-sm font-medium text-text-primary">{task.title}</p>
                        <p className="text-xs text-text-secondary">
                          {task.project.name} &middot; Due {task.dueDate ? formatDate(task.dueDate) : 'N/A'}
                        </p>
                      </div>
                    ))}
                    {overdueTasks.length > 10 && (
                      <p className="text-xs text-text-secondary">
                        +{overdueTasks.length - 10} more overdue tasks
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  const myTasks = await prisma.task.findMany({
    where: {
      assignees: { some: { userId: user.id } },
      deletedAt: null,
    },
    select: { status: true, priority: true, completedAt: true, title: true, createdAt: true },
  });

  const myCompleted = myTasks.filter((t) => t.status === 'DONE');
  const myInProgress = myTasks.filter((t) => t.status === 'IN_PROGRESS');
  const myTodo = myTasks.filter((t) => t.status === 'TODO');
  const myOverdue = myTasks.filter((t) => t.status !== 'DONE');

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <User className="h-7 w-7 text-text-secondary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">My Reports</h1>
              <p className="text-sm text-text-secondary">Your personal task statistics</p>
            </div>
          </div>
          <ExportButton onExport={(format) => format === 'csv' ? exportCSV(myTasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })), 'my-reports') : exportPDF()} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{myTasks.length}</p>
                <p className="text-xs text-text-secondary">Total Assigned</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-light text-accent-green">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{myCompleted.length}</p>
                <p className="text-xs text-text-secondary">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber-light text-accent-amber">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{myInProgress.length}</p>
                <p className="text-xs text-text-secondary">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple-light text-accent-purple">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {myTasks.length > 0
                    ? Math.round((myCompleted.length / myTasks.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-text-secondary">Completion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Task Breakdown</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'To Do', count: myTodo.length, color: 'bg-text-tertiary' },
                  { label: 'In Progress', count: myInProgress.length, color: 'bg-accent-blue' },
                  { label: 'Completed', count: myCompleted.length, color: 'bg-accent-green' },
                ].map(({ label, count, color }) => {
                  const pct = myTasks.length > 0 ? (count / myTasks.length) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-text-primary">{label}</span>
                        <span className="font-medium text-text-primary">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-bg-hover">
                        <div
                          className={`h-full rounded-full ${color} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent-amber" />
                <h2 className="text-lg font-semibold text-text-primary">Open Tasks</h2>
              </div>
            </CardHeader>
            <CardContent>
              {myOverdue.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="mb-2 h-8 w-8 text-accent-green" />
                  <p className="text-sm font-medium text-text-primary">All caught up!</p>
                  <p className="text-xs text-text-secondary">You have no open tasks</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myOverdue.slice(0, 10).map((task, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
