'use client';

import { Users, FolderKanban, ClipboardList, Activity, AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LinkRow } from '@/components/ui/link-row';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { PageTransition } from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import { StatusDistribution } from '@/components/dashboard/StatusDistribution';
import { ProductivityChart } from '@/components/dashboard/ProductivityChart';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { CompletionRate } from '@/components/dashboard/CompletionRate';
import { PriorityChart } from '@/components/dashboard/PriorityChart';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid.client';
import type { User, TaskWithRelations } from '@/types';
import { cn, formatDate, isOverdue, getDashboardGreeting } from '@/lib/helpers';

type DashboardData = {
  user: User;
  role: string;
  isPersonalMode?: boolean;
  totalUsers?: number;
  totalProjects?: number;
  totalTaskCount?: number;
  active?: number;
  recentUsers?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'createdAt'>[];
  allTasks?: TaskWithRelations[];
  statusData?: { status: string; count: number }[];
  priorityData?: { priority: string; count: number }[];
  projectProgressData?: { id: string; name: string; status: string; totalTasks: number; completedTasks: number }[];
  productivityData?: { date: string; count: number }[];
  myTasks?: TaskWithRelations[];
  managedTasks?: TaskWithRelations[];
  managedProjectIds?: string[];
  completedManagedTasks?: number;
  totalManagedTasks?: number;
  projects?: { id: string; name: string; status: string; _count: { tasks: number } }[];
  completedCount?: number;
  taskCount?: number;
  tasks?: TaskWithRelations[];
  overdueTasks?: TaskWithRelations[];
  myActiveTasks?: TaskWithRelations[];
  completedTasks?: TaskWithRelations[];
};

interface DashboardClientProps {
  data: DashboardData;
}

export function DashboardClient({ data }: DashboardClientProps) {
  const { user, role } = data;
  const now = new Date();

  const widgets = (
    <DashboardGrid storageKey={`dashboard-${user.id}`}>
      {role === 'ADMINISTRATOR' && (
        <>
          <div id="admin-kpi" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Users" value={data.totalUsers ?? 0} icon={<Users className="h-5 w-5" />} color="text-accent-blue" delay={0} />
            <KpiCard label="Total Projects" value={data.totalProjects ?? 0} icon={<FolderKanban className="h-5 w-5" />} color="text-accent-purple" delay={0.05} />
            <KpiCard label="Total Tasks" value={data.totalTaskCount ?? 0} icon={<ClipboardList className="h-5 w-5" />} delay={0.1} />
            <KpiCard label="Active Tasks" value={data.active ?? 0} icon={<Activity className="h-5 w-5" />} color="text-accent-green" delay={0.15} />
          </div>
          <div id="admin-charts-1" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatusDistribution data={data.statusData ?? []} />
            <Card variant="elevated">
              <CardHeader>Recent Signups</CardHeader>
              <CardContent>
                {data.recentUsers?.length === 0 ? (
                  <p className="py-4 text-center text-sm text-text-tertiary">No users yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentUsers?.map((u) => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-light text-sm font-semibold text-accent-blue">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{u.firstName} {u.lastName}</p>
                          <p className="truncate text-xs text-text-tertiary">{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div id="admin-charts-2" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PriorityChart data={data.priorityData ?? []} />
            <CompletionRate completed={data.completedCount ?? 0} total={data.totalTaskCount ?? 0} />
          </div>
          {data.projectProgressData && data.projectProgressData.length > 0 && (
            <div id="admin-progress">
              <ProjectProgress projects={data.projectProgressData} />
            </div>
          )}
          {data.allTasks && data.allTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'DONE').length > 0 && (
            <div id="admin-overdue">
              <Card variant="elevated">
                <CardHeader>
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent-red" />
                    Overdue Tasks
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StaggerList className="space-y-2">
                    {data.allTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'DONE').slice(0, 5).map((task) => {
                      const daysOverdue = task.dueDate ? Math.floor((now.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <StaggerItem key={task.id}>
                          <LinkRow
                            href={`/tasks/${task.id}`}
                            className={cn(
                              'border-l-[3px]',
                              daysOverdue >= 3 ? 'border-l-accent-red' : 'border-l-accent-amber',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-text-primary">{task.title}</p>
                              <p className="text-sm text-text-secondary">{task.project.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={task.status} />
                              <span className="whitespace-nowrap text-xs font-medium text-accent-red">{daysOverdue}d overdue</span>
                            </div>
                          </LinkRow>
                        </StaggerItem>
                      );
                    })}
                  </StaggerList>
                </CardContent>
              </Card>
            </div>
          )}
          {data.productivityData && data.productivityData.length > 0 && (
            <div id="admin-productivity">
              <ProductivityChart data={data.productivityData} granularity="day" title="Organization Productivity" />
            </div>
          )}
        </>
      )}

      {role === 'MANAGER' && (
        <>
          <div id="manager-kpi" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="My Tasks" value={data.myTasks?.length ?? 0} icon={<ClipboardList className="h-5 w-5" />} delay={0} />
            <KpiCard label="Managed Projects" value={data.projects?.length ?? 0} icon={<FolderKanban className="h-5 w-5" />} color="text-accent-purple" delay={0.05} />
            <KpiCard label="Team Tasks" value={data.totalManagedTasks ?? 0} icon={<Users className="h-5 w-5" />} delay={0.1} />
            <KpiCard label="Overdue" value={data.overdueTasks?.length ?? 0} icon={<AlertTriangle className="h-5 w-5" />} color="text-accent-red" delay={0.15} />
          </div>
          {data.projects && data.projects.length > 0 && (
            <div id="manager-projects">
              <Card variant="elevated">
                <CardHeader>
                  <span className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-accent-purple" />
                    My Projects
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.projects.map((p) => (
                      <LinkRow key={p.id} href={`/projects/${p.id}`} className="block">
                        <div>
                          <p className="font-medium text-text-primary">{p.name}</p>
                          <p className="text-sm text-text-secondary">{p._count.tasks} tasks</p>
                        </div>
                      </LinkRow>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div id="manager-charts-1" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CompletionRate completed={data.completedManagedTasks ?? 0} total={data.totalManagedTasks ?? 0} />
            <PriorityChart data={data.priorityData ?? []} />
          </div>
          <div id="manager-charts-2" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductivityChart data={data.productivityData ?? []} granularity="day" />
            <StatusDistribution data={data.statusData ?? []} />
          </div>
          <div id="manager-tasks">
            <Card variant="elevated">
              <CardHeader>Team Tasks</CardHeader>
              <CardContent>
                {!data.managedTasks?.length && !data.myTasks?.length ? (
                  <p className="py-8 text-center text-sm text-text-tertiary">No tasks yet.</p>
                ) : (
                  <StaggerList className="space-y-2">
                    {Array.from(new Map([...(data.managedTasks ?? []), ...(data.myTasks ?? [])].map((t) => [t.id, t])).values()).slice(0, 10).map((task) => (
                      <StaggerItem key={task.id}>
                        <LinkRow href={`/tasks/${task.id}`}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">{task.title}</p>
                            <p className="text-sm text-text-secondary">{task.project.name}</p>
                          </div>
                          <StatusBadge status={task.status} />
                        </LinkRow>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {data.isPersonalMode && (
        <>
          <div id="personal-kpi" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="My Tasks" value={data.tasks?.length ?? 0} icon={<ClipboardList className="h-5 w-5" />} delay={0} />
            <KpiCard label="Active" value={data.myActiveTasks?.length ?? 0} icon={<Activity className="h-5 w-5" />} color="text-accent-blue" delay={0.05} />
            <KpiCard label="Overdue" value={data.overdueTasks?.length ?? 0} icon={<AlertTriangle className="h-5 w-5" />} color="text-accent-red" delay={0.1} />
            <KpiCard label="Completed" value={data.completedTasks?.length ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} color="text-accent-green" delay={0.15} />
          </div>
          <div id="personal-charts" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatusDistribution data={data.statusData ?? []} />
            <PriorityChart data={data.priorityData ?? []} />
          </div>
          <div id="personal-tasks" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card variant="elevated">
              <CardHeader>
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent-blue" />
                  My Active Tasks
                </span>
              </CardHeader>
              <CardContent>
                {(!data.myActiveTasks || data.myActiveTasks.length === 0) ? (
                  <p className="py-8 text-center text-sm text-text-tertiary">No active tasks. Create one to get started!</p>
                ) : (
                  <StaggerList className="space-y-2">
                    {data.myActiveTasks.slice(0, 10).map((task) => (
                      <StaggerItem key={task.id}>
                        <LinkRow href={`/tasks/${task.id}`}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">{task.title}</p>
                            <p className="text-sm text-text-secondary">{task.project.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </LinkRow>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-green" />
                  Recent Completions
                </span>
              </CardHeader>
              <CardContent>
                {(!data.completedTasks || data.completedTasks.length === 0) ? (
                  <p className="py-8 text-center text-sm text-text-tertiary">No completed tasks yet.</p>
                ) : (
                  <StaggerList className="space-y-2">
                    {data.completedTasks.slice(0, 10).map((task) => (
                      <StaggerItem key={task.id}>
                        <LinkRow href={`/tasks/${task.id}`} className="items-start justify-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green-light">
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">{task.title}</p>
                            <p className="text-xs text-text-tertiary">{task.project.name} · {task.completedAt ? formatDate(task.completedAt) : ''}</p>
                          </div>
                        </LinkRow>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {role === 'TEAM_MEMBER' && !data.isPersonalMode && (
        <>
          <div id="member-kpi" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Total Tasks" value={data.taskCount ?? 0} icon={<ClipboardList className="h-5 w-5" />} delay={0} />
            <KpiCard label="Active" value={data.myActiveTasks?.length ?? 0} icon={<Activity className="h-5 w-5" />} color="text-accent-blue" delay={0.05} />
            <KpiCard label="Overdue" value={data.overdueTasks?.length ?? 0} icon={<AlertTriangle className="h-5 w-5" />} color="text-accent-red" delay={0.1} />
            <KpiCard label="Due This Week" value={0} icon={<Clock className="h-5 w-5" />} color="text-accent-amber" delay={0.15} />
            <KpiCard label="Completed This Week" value={0} icon={<CheckCircle2 className="h-5 w-5" />} color="text-accent-green" delay={0.2} />
          </div>
          <div id="member-charts-1" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StatusDistribution data={data.statusData ?? []} />
            <PriorityChart data={data.priorityData ?? []} />
          </div>
          <div id="member-charts-2" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductivityChart data={data.productivityData ?? []} granularity="day" />
            <CompletionRate completed={data.completedCount ?? 0} total={data.taskCount ?? 0} />
          </div>
          {data.overdueTasks && data.overdueTasks.length > 0 && (
            <div id="member-overdue">
              <Card variant="elevated">
                <CardHeader>
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent-red" />
                    Overdue Tasks
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StaggerList className="space-y-2">
                    {data.overdueTasks.slice(0, 5).map((task) => {
                      const daysOverdue = task.dueDate ? Math.floor((now.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                      return (
                        <StaggerItem key={task.id}>
                          <LinkRow
                            href={`/tasks/${task.id}`}
                            className={cn(
                              'border-l-[3px]',
                              daysOverdue >= 3 ? 'border-l-accent-red' : 'border-l-accent-amber',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-text-primary">{task.title}</p>
                              <p className="text-sm text-text-secondary">{task.project.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={task.status} />
                              <PriorityBadge priority={task.priority} />
                              {task.dueDate && (
                                <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent-red">
                                  <AlertTriangle className="h-3 w-3" />
                                  {daysOverdue}d overdue
                                </span>
                              )}
                            </div>
                          </LinkRow>
                        </StaggerItem>
                      );
                    })}
                  </StaggerList>
                </CardContent>
              </Card>
            </div>
          )}
          <div id="member-tasks" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card variant="elevated">
              <CardHeader>
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent-blue" />
                  My Active Tasks
                </span>
              </CardHeader>
              <CardContent>
                {(!data.myActiveTasks || data.myActiveTasks.length === 0) ? (
                  <p className="py-8 text-center text-sm text-text-tertiary">No active tasks. Great work!</p>
                ) : (
                  <StaggerList className="space-y-2">
                    {data.myActiveTasks.slice(0, 10).map((task) => (
                      <StaggerItem key={task.id}>
                        <LinkRow href={`/tasks/${task.id}`}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">{task.title}</p>
                            <p className="text-sm text-text-secondary">{task.project.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </LinkRow>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent-green" />
                  Recent Activity
                </span>
              </CardHeader>
              <CardContent>
                {(!data.completedTasks || data.completedTasks.length === 0) ? (
                  <p className="py-8 text-center text-sm text-text-tertiary">No recent activity.</p>
                ) : (
                  <StaggerList className="space-y-2">
                    {data.completedTasks.slice(0, 10).map((task) => (
                      <StaggerItem key={task.id}>
                        <LinkRow href={`/tasks/${task.id}`} className="items-start justify-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green-light">
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-text-primary">{task.title}</p>
                            <p className="text-xs text-text-tertiary">{task.project.name} · {task.completedAt ? formatDate(task.completedAt) : ''}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-text-tertiary" />
                        </LinkRow>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardGrid>
  );

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {getDashboardGreeting(user.firstName)}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {data.isPersonalMode ? 'Personal Workspace' : role === 'ADMINISTRATOR' ? 'Command Center · Administrator' : role === 'MANAGER' ? 'Team Lead Hub' : 'My Work'}
            </p>
          </div>
        </div>
        {widgets}
      </div>
    </PageTransition>
  );
}
