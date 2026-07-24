'use client';

import Link from 'next/link';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { AvatarGroup } from '@/components/ui/avatar';
import { MotionCard } from '@/components/animations/MotionCard';
import type { TaskWithRelations } from '@/types';

interface TaskCardProps {
  task: TaskWithRelations;
}

export function TaskCard({ task }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();
  const assignees = task.assignees.map((a) => a.user);

  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <MotionCard className="cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-text-primary">
              {task.title}
            </h3>
            {task.project && (
              <p className="mt-0.5 text-xs text-text-tertiary">{task.project.name}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            {dueDate && (
              <span
                className={`text-xs ${
                  isOverdue ? 'text-accent-red' : 'text-text-tertiary'
                }`}
              >
                {dueDate.toLocaleDateString()}
              </span>
            )}
          </div>
          {assignees.length > 0 && (
            <AvatarGroup users={assignees} max={3} size="sm" />
          )}
        </div>
      </MotionCard>
    </Link>
  );
}
