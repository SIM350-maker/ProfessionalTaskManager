"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskStatus, TaskWithRelations, ProjectWithRelations } from "@/types";

export interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
  tasksDueThisWeek: number;
  completedThisWeek: number;
  totalProjects: number;
  activeProjects: number;
  teamMembers: number;
  completionRate: number;
}

export interface ActivityItem {
  id: string;
  type:
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_COMPLETED"
    | "COMMENT_ADDED"
    | "PROJECT_CREATED"
    | "MEMBER_JOINED";
  message: string;
  entityType: "Task" | "Project" | "User";
  entityId: string;
  actorName: string;
  actorAvatar: string | null;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: TaskWithRelations[];
  recentProjects: ProjectWithRelations[];
  activityFeed: ActivityItem[];
}

export function useDashboardStats(): {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json.data as DashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

export function computeDashboardStats(
  tasks: TaskWithRelations[],
  projects: ProjectWithRelations[]
): DashboardStats {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const tasksByStatus = {} as Record<TaskStatus, number>;
  let overdueCount = 0;
  let dueThisWeek = 0;
  let completedThisWeek = 0;

  for (const task of tasks) {
    tasksByStatus[task.status] = (tasksByStatus[task.status] ?? 0) + 1;

    if (
      task.dueDate &&
      new Date(task.dueDate) < now &&
      task.status !== "DONE" &&
      task.status !== "ARCHIVED"
    ) {
      overdueCount++;
    }

    if (task.dueDate) {
      const due = new Date(task.dueDate);
      if (due >= now && due <= endOfWeek) dueThisWeek++;
    }

    if (task.status === "DONE" && task.completedAt) {
      const completedDate = new Date(task.completedAt);
      if (completedDate >= startOfWeek) completedThisWeek++;
    }
  }

  return {
    totalTasks: tasks.length,
    tasksByStatus,
    overdueTasks: overdueCount,
    tasksDueThisWeek: dueThisWeek,
    completedThisWeek,
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    teamMembers: 0,
    completionRate:
      tasks.length > 0 ? Math.round(((tasksByStatus["DONE"] ?? 0) / tasks.length) * 100) : 0,
  };
}

export function getDashboardGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}
