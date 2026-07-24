'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn, formatDate } from '@/lib/helpers';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { AvatarGroup } from '@/components/ui/avatar';
import type { TaskWithRelations } from '@/types';
import type { CSSProperties } from 'react';

interface KanbanCardProps {
  task: TaskWithRelations;
  isOverlay?: boolean;
}

const priorityBorderColors: Record<string, string> = {
  URGENT: 'bg-accent-red',
  HIGH: 'bg-accent-amber',
  MEDIUM: 'bg-accent-blue',
  LOW: 'bg-text-tertiary',
};

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
    disabled: isOverlay,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const content = (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
      className={cn(
        'relative cursor-grab rounded-lg border border-border-default bg-bg-card p-3 shadow-sm transition-shadow',
        'hover:shadow-hover active:cursor-grabbing',
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-lg',
          priorityBorderColors[task.priority] ?? 'bg-text-tertiary',
        )}
      />
      <div className="ml-2 space-y-2">
        <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
        <p className="truncate text-xs text-text-secondary">{task.project.name}</p>
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <AvatarGroup users={task.assignees.map((a) => a.user)} max={3} size="sm" />
          {task.dueDate && (
            <span className={cn('text-xs shrink-0', new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-accent-red' : 'text-text-tertiary')}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isOverlay) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      layout
    >
      {content}
    </motion.div>
  );
}