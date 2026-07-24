import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { PageTransition } from '@/components/animations/PageTransition';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { formatDate, formatDateTime } from '@/lib/helpers';
import { MessageSquare, Activity, Users, FileText, Plus, ClipboardList, CheckCircle2, AlertTriangle, CalendarIcon } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const user = await requireRole('ADMINISTRATOR', 'MANAGER');
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || 'overview';

  const [project, recentActivity, projectComments] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
            role: { select: { id: true, name: true } },
          },
        },
        tasks: {
          where: { deletedAt: null },
          include: {
            assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
            comments: { where: { deletedAt: null, parentCommentId: null }, take: 5, orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
          },
          orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
        },
      },
    }),
    prisma.activityLog.findMany({
      where: { organizationId: user.organizationId, entityType: 'TASK', createdAt: { gte: SEVEN_DAYS_AGO } },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.comment.findMany({
      where: { task: { projectId: id, deletedAt: null }, deletedAt: null, parentCommentId: null },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }, task: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!project || project.organizationId !== user.organizationId) {
    notFound();
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'tasks', label: 'Tasks', icon: ClipboardList },
    { key: 'timeline', label: 'Timeline', icon: CalendarIcon },
    { key: 'members', label: 'Members', icon: Users },
    { key: 'activity', label: 'Activity', icon: Activity },
    { key: 'discussions', label: 'Discussions', icon: MessageSquare },
  ];

  const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {project.color && <div className="h-4 w-4 rounded-full" data-color={project.color} style={{ backgroundColor: project.color }} />}
              <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && <p className="mt-1 text-text-secondary">{project.description}</p>}
          </div>
          <div className="flex gap-3">
            <Link href={`/projects/${id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Link href={`/tasks/new?projectId=${id}`}>
              <Button icon={<Plus className="h-4 w-4" />}>New Task</Button>
            </Link>
          </div>
        </div>

        <div className="border-b border-border-default overflow-x-auto">
          <nav className="-mb-px flex gap-6 min-w-max">
            {tabs.map((tb) => {
              const Icon = tb.icon;
              return (
                <Link
                  key={tb.key}
                  href={`/projects/${id}?tab=${tb.key}`}
                  className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    activeTab === tb.key
                      ? 'border-accent-blue text-accent-blue'
                      : 'border-transparent text-text-secondary hover:border-border-hover hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tb.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card variant="kpi">
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
                    <ClipboardList className="h-5 w-5" />
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
                    <CheckCircle2 className="h-5 w-5" />
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
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">{overdueTasks}</p>
                    <p className="text-xs text-text-secondary">Overdue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text-primary">Project Progress</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 w-full rounded-full bg-bg-hover">
                      <div className="h-3 rounded-full bg-accent-green transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{progress}%</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {project.tasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<string, number>) && (
                    Object.entries(project.tasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                        <StatusBadge status={status} />
                        <span className="text-sm font-semibold text-text-primary">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-text-primary">Project Details</h2>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-text-primary">Visibility:</span>{' '}
                  <span className="text-text-secondary">{project.visibility}</span>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Owner:</span>{' '}
                  <span className="text-text-secondary">{project.owner.firstName} {project.owner.lastName}</span>
                </div>
                {project.startDate && (
                  <div>
                    <span className="font-medium text-text-primary">Start:</span>{' '}
                    <span className="text-text-secondary">{formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <span className="font-medium text-text-primary">End:</span>{' '}
                    <span className="text-text-secondary">{formatDate(project.endDate)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-text-primary">Tasks:</span>{' '}
                  <span className="text-text-secondary">{project.tasks.length}</span>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Members:</span>{' '}
                  <span className="text-text-secondary">{project.members.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tasks' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">Tasks ({project.tasks.length})</h2>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <p className="text-sm text-text-secondary">No tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.tasks.map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center justify-between rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">{task.title}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <AvatarGroup users={task.assignees.map((a) => a.user)} size="sm" max={3} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        {task.dueDate && (
                          <span className="text-sm text-text-secondary">{formatDate(task.dueDate)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <ProjectTimeline projectId={project.id} />
        )}

        {activeTab === 'members' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">Members ({project.members.length})</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3">
                  <Avatar {...member.user} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-xs text-text-secondary">{member.role.name}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-text-secondary">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                      <Avatar firstName={log.user?.firstName ?? ''} lastName={log.user?.lastName ?? ''} avatarUrl={log.user?.avatarUrl ?? null} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary">
                          <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span> {log.action.toLowerCase().replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-text-tertiary">{formatDateTime(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'discussions' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">Discussions ({projectComments.length})</h2>
            </CardHeader>
            <CardContent>
              {projectComments.length === 0 ? (
                <p className="text-sm text-text-secondary">No discussions yet. Comments on tasks will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {projectComments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 rounded-lg border border-border-default p-4">
                      <Avatar {...comment.author} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary">{comment.author.firstName} {comment.author.lastName}</p>
                          <span className="text-xs text-text-tertiary">on {comment.task.title}</span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">{comment.message}</p>
                        <p className="mt-1 text-xs text-text-tertiary">{formatDateTime(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
