'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/helpers';
import { KanbanCard } from './KanbanCard';
import type { TaskWithRelations, TaskStatus } from '@/types';

const COLUMNS: { id: TaskStatus; label: string; color: string; wipLimit?: number }[] = [
  { id: 'TODO', label: 'To Do', color: 'border-t-text-tertiary', wipLimit: 10 },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-accent-blue', wipLimit: 5 },
  { id: 'IN_REVIEW', label: 'In Review', color: 'border-t-accent-amber', wipLimit: 5 },
  { id: 'DONE', label: 'Done', color: 'border-t-accent-green' },
  { id: 'ARCHIVED', label: 'Archived', color: 'border-t-text-tertiary' },
];

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function ColumnContainer({
  column,
  tasks,
}: {
  column: (typeof COLUMNS)[number];
  tasks: TaskWithRelations[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  const atLimit = column.wipLimit !== undefined && tasks.length >= column.wipLimit;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className={cn('sticky top-0 z-10 mb-3 flex items-center justify-between rounded-t-lg border-t-4 bg-bg-subtle px-3 py-2', column.color)}>
        <h3 className="text-sm font-semibold text-text-primary">{column.label}</h3>
        <div className="flex items-center gap-2">
          {column.wipLimit !== undefined && (
            <span className={cn('text-xs', atLimit ? 'text-accent-red font-medium' : 'text-text-tertiary')}>
              {tasks.length}/{column.wipLimit}
            </span>
          )}
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-hover px-1.5 text-xs font-medium text-text-secondary">
            {tasks.length}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 overflow-y-auto rounded-b-lg bg-bg-subtle p-2 transition-colors',
          isOver && 'bg-bg-active',
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-text-tertiary">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithRelations[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
      ARCHIVED: [],
    };
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.TODO.push(task);
      }
    }
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetStatus: TaskStatus | null = null;

    if (over.id.toString().startsWith('column-')) {
      targetStatus = over.id.toString().replace('column-', '') as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      const column = COLUMNS.find((c) => c.id === targetStatus);
      if (column?.wipLimit !== undefined) {
        const targetTasks = columns[targetStatus];
        if (targetTasks.length >= column.wipLimit) return;
      }
      onStatusChange(taskId, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <ColumnContainer key={col.id} column={col} tasks={columns[col.id]} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
