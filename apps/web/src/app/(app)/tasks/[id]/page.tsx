import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate, formatDateTime } from '@/lib/helpers';
import { cn } from '@/lib/helpers';
import { updateTaskStatus } from '@/actions';
import { Clock, RefreshCw, Check } from 'lucide-react';
import type { CommentWithRelations } from '@/types';

function CommentThread({ comment }: { comment: CommentWithRelations }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar
          firstName={comment.author.firstName}
          lastName={comment.author.lastName}
          avatarUrl={comment.author.avatarUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-xs text-text-tertiary">
              {formatDateTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">
            {comment.message}
          </p>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-border-default pl-4">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, lead: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      labels: { include: { label: true } },
      comments: {
        where: { deletedAt: null, parentCommentId: null },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          replies: {
            where: { deletedAt: null },
            include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      creator: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/projects/${task.project.id}`} className="text-sm text-text-link hover:underline">
              {task.project.name}
            </Link>
            <span className="text-text-tertiary">/</span>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{task.title}</h1>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={task.status} dot />
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-sm text-text-secondary">Due: {formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/tasks/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {task.description && (
            <Card variant="elevated">
              <CardHeader>Description</CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
                  {task.description}
                </p>
              </CardContent>
            </Card>
          )}

          {task.comments.length > 0 && (
            <Card variant="elevated">
              <CardHeader>Comments</CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {task.comments.map((comment) => (
                    <CommentThread key={comment.id} comment={comment} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card variant="elevated">
            <CardHeader>Activity</CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-blue-light">
                    <Clock className="h-3.5 w-3.5 text-accent-blue" />
                  </span>
                  <div className="text-sm text-text-secondary">
                    Task created by <span className="font-medium text-text-primary">{task.creator.firstName} {task.creator.lastName}</span> on {formatDateTime(task.createdAt)}
                  </div>
                </div>
                {task.updatedAt > task.createdAt && (
                  <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-amber-light">
                      <RefreshCw className="h-3.5 w-3.5 text-accent-amber" />
                    </span>
                    <div className="text-sm text-text-secondary">
                      Last updated on {formatDateTime(task.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>Details</CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">Assignees</span>
                <div className="mt-1.5">
                  {task.assignees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.assignees.map((a) => (
                        <div key={a.id} className="flex items-center gap-1.5">
                          <Avatar
                            firstName={a.user.firstName}
                            lastName={a.user.lastName}
                            avatarUrl={a.user.avatarUrl}
                            size="sm"
                          />
                          <span className="text-sm text-text-secondary">
                            {a.user.firstName} {a.user.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-tertiary">No assignees</p>
                  )}
                </div>
              </div>

              {task.project.lead && (
                <>
                  <div className="h-px bg-border-default" />
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">Project Lead</span>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Avatar
                        firstName={task.project.lead.firstName}
                        lastName={task.project.lead.lastName}
                        avatarUrl={task.project.lead.avatarUrl}
                        size="sm"
                      />
                      <span className="text-sm text-text-secondary">
                        {task.project.lead.firstName} {task.project.lead.lastName}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="h-px bg-border-default" />

              {task.estimatedHours && (
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Estimated</span>
                  <span className="font-medium text-text-primary">{task.estimatedHours}h</span>
                </div>
              )}
              {task.startDate && (
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Start date</span>
                  <span className="text-text-secondary">{formatDate(task.startDate)}</span>
                </div>
              )}
              {task.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Completed</span>
                  <span className="font-medium text-accent-green">{formatDate(task.completedAt)}</span>
                </div>
              )}

              {task.labels.length > 0 && (
                <>
                  <div className="h-px bg-border-default" />
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">Labels</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {task.labels.map((tl) => (
                        <span
                          key={tl.id}
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          data-label-color={tl.label.color}
                          style={{ backgroundColor: tl.label.color + '20', color: tl.label.color }}
                        >
                          {tl.label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>Status</CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map((status) => (
                  <form key={status} action={async () => {
                    'use server';
                    await updateTaskStatus(id, status);
                  }}>
                    <button
                      type="submit"
                      className={cn(
                        'w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all',
                        task.status === status
                          ? 'bg-accent-blue-light text-accent-blue border border-accent-blue'
                          : 'text-text-secondary border border-transparent hover:bg-bg-hover hover:text-text-primary',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {task.status === status && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        {status === 'TODO' ? 'To Do' :
                         status === 'IN_PROGRESS' ? 'In Progress' :
                         status === 'IN_REVIEW' ? 'In Review' : 'Done'}
                      </div>
                    </button>
                  </form>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
