'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TaskStatus, Priority, TaskWithRelations } from '@/types';
import type { CustomFieldDefinition, WorkflowWithStates } from '@/types';
import { STATUS_LABELS } from '@/lib/constants';

export interface TaskFilters {
  search: string;
  status: TaskStatus | null;
  priority: Priority | null;
  assigneeId: string | null;
  projectId: string | null;
  labelId: string | null;
  dueDateRange: { start: string; end: string } | null;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: TaskWithRelations[];
}

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: null,
  priority: null,
  assigneeId: null,
  projectId: null,
  labelId: null,
  dueDateRange: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'DONE'],
  IN_REVIEW: ['IN_PROGRESS', 'DONE'],
  DONE: ['ARCHIVED', 'IN_PROGRESS'],
  ARCHIVED: ['DONE'],
};

export const VALID_TRANSITIONS = STATUS_TRANSITIONS;

export function statusTransitions(currentStatus: TaskStatus): TaskStatus[] {
  return STATUS_TRANSITIONS[currentStatus] ?? [];
}

export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === 'DONE' || status === 'ARCHIVED';
}

export function useTaskFilters(initial?: Partial<TaskFilters>) {
  const [filters, setFilters] = useState<TaskFilters>({ ...DEFAULT_FILTERS, ...initial });

  const setFilter = useCallback(<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.status !== null ||
      filters.priority !== null ||
      filters.assigneeId !== null ||
      filters.projectId !== null ||
      filters.labelId !== null ||
      filters.dueDateRange !== null,
    [filters],
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
}

export function useKanbanBoard(tasks: TaskWithChanges[]) {
  const columns = useMemo<KanbanColumn[]>(() => {
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'];
    return statuses.map((status) => ({
      id: status,
      title: STATUS_LABELS[status] ?? status,
      tasks: tasks.filter((t) => t.status === status),
    }));
  }, [tasks]);

  const moveTask = useCallback(
    (taskId: string, toStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !canTransitionStatus(task.status, toStatus)) return;
    },
    [tasks],
  );

  return { columns, moveTask };
}

export function sortTasks(tasks: TaskWithChanges[], sortBy: TaskFilters['sortBy'], order: TaskFilters['sortOrder']) {
  return [...tasks].sort((a, b) => {
    const dir = order === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
      case 'priority': {
        const priorityOrder: Record<Priority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir;
      }
      case 'createdAt':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case 'updatedAt':
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      default:
        return 0;
    }
  });
}

export function filterTasks(tasks: TaskWithChanges[], filters: TaskFilters): TaskWithChanges[] {
  return tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.description?.toLowerCase().includes(q)) return false;
    }
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assigneeId && !task.assignees?.some((a) => a.userId === filters.assigneeId)) return false;
    if (filters.projectId && task.projectId !== filters.projectId) return false;
    if (filters.dueDateRange) {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      if (due < new Date(filters.dueDateRange.start) || due > new Date(filters.dueDateRange.end)) return false;
    }
    return true;
  });
}

type TaskWithChanges = TaskWithRelations & { status: TaskStatus };

export interface TaskCustomFields extends Record<string, unknown> {}

export function useTaskCustomFields(projectId: string | undefined) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/v1/custom-fields?entityType=TASK&projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setFields(data.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { fields, loading, error };
}

export function getWorkflowForTask(task: TaskWithRelations): WorkflowWithStates | null {
  return (task as unknown as { workflow?: WorkflowWithStates }).workflow ?? null;
}
