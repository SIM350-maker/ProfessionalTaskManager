'use client';

import { useMemo } from 'react';
import type { ProjectStatus, ProjectWithRelations, TaskStatus } from '@/types';
import { PROJECT_STATUS_LABELS } from '@/lib/constants';
import { isOverdue } from '@/lib/helpers';

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  totalMembers: number;
  daysRemaining: number | null;
}

export type ProjectHealth = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'not_started';

export interface ProjectHealthInfo {
  health: ProjectHealth;
  label: string;
  color: string;
}

export function useProjectStats(project: ProjectWithRelations): ProjectStats {
  return useMemo(() => {
    if (!project._count) return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, overdueTasks: 0, completionPercentage: 0, totalMembers: project.members?.length ?? 0, daysRemaining: null };

    const now = new Date();
    let overdueCount = 0;
    let tasks: { status: TaskStatus; dueDate: Date | null }[] | undefined;
    if (project._count.tasks) {
      tasks = (project as ProjectWithRelations & { tasks?: { status: TaskStatus; dueDate: Date | null }[] }).tasks;
      if (tasks) {
        for (const task of tasks) {
          if (isOverdue(task.dueDate) && task.status !== 'DONE' && task.status !== 'ARCHIVED') {
            overdueCount++;
          }
        }
      }
    }

    const daysRemaining = project.endDate
      ? Math.max(0, Math.ceil((new Date(project.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    const completedTasks = tasks
      ? tasks.filter((t) => t.status === 'DONE' || t.status === 'ARCHIVED').length
      : 0;
    const inProgressTasks = tasks
      ? tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length
      : 0;

    return {
      totalTasks: project._count.tasks ?? 0,
      completedTasks,
      inProgressTasks,
      overdueTasks: overdueCount,
      completionPercentage: project._count.tasks
        ? Math.round((completedTasks / project._count.tasks) * 100)
        : 0,
      totalMembers: project.members?.length ?? 0,
      daysRemaining,
    };
  }, [project]);
}

export function getProjectHealth(project: ProjectWithRelations): ProjectHealthInfo {
  if (project.status === 'COMPLETED') return { health: 'completed', label: 'Completed', color: '#22c55e' };
  if (project.status === 'ARCHIVED') return { health: 'completed', label: 'Archived', color: '#6b7280' };
  if (project.status === 'ON_HOLD') return { health: 'at_risk', label: 'On Hold', color: '#f59e0b' };
  if (project.status === 'PLANNING') return { health: 'not_started', label: 'Planning', color: '#3b82f6' };

  if (!project.endDate) return { health: 'on_track', label: 'Active', color: '#22c55e' };

  const now = new Date();
  const end = new Date(project.endDate);
  const totalMs = end.getTime() - new Date(project.startDate ?? project.createdAt).getTime();
  const elapsedMs = now.getTime() - new Date(project.startDate ?? project.createdAt).getTime();

  if (elapsedMs <= 0) return { health: 'not_started', label: 'Not Started', color: '#3b82f6' };

  const progress = (project._count?.tasks ?? 0) > 0 ? 0 : 0.5;
  const timeElapsed = elapsedMs / totalMs;

  if (timeElapsed > progress + 0.25) return { health: 'behind', label: 'Behind Schedule', color: '#ef4444' };
  if (timeElapsed > progress + 0.1) return { health: 'at_risk', label: 'At Risk', color: '#f59e0b' };
  return { health: 'on_track', label: 'On Track', color: '#22c55e' };
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}
