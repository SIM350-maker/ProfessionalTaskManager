import { prisma } from '@/lib/database';

interface ProductivityStats {
  tasksCompletedThisWeek: number;
  tasksOverdue: number;
  averageCompletionTimeHours: number | null;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export async function getUserProductivityStats(userId: string): Promise<ProductivityStats> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    tasksCompletedThisWeek,
    tasksOverdue,
    completedTasks,
    totalTasks,
    tasksByStatus,
    tasksByPriority,
  ] = await Promise.all([
    prisma.task.count({
      where: {
        assignees: { some: { userId } },
        status: 'DONE',
        completedAt: { gte: startOfWeek },
        deletedAt: null,
      },
    }),
    prisma.task.count({
      where: {
        assignees: { some: { userId } },
        status: { not: 'DONE' },
        dueDate: { lt: now },
        deletedAt: null,
      },
    }),
    prisma.task.findMany({
      where: {
        assignees: { some: { userId } },
        status: 'DONE',
        completedAt: { not: null },
        deletedAt: null,
      },
      select: { createdAt: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
      take: 500,
    }),
    prisma.task.count({
      where: {
        assignees: { some: { userId } },
        deletedAt: null,
      },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: {
        assignees: { some: { userId } },
        deletedAt: null,
      },
      _count: { id: true },
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: {
        assignees: { some: { userId } },
        deletedAt: null,
      },
      _count: { id: true },
    }),
  ]);

  let totalHours = 0;
  let completedCount = 0;
  for (const task of completedTasks) {
    if (task.createdAt && task.completedAt) {
      const diffHours = (task.completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60);
      totalHours += diffHours;
      completedCount++;
    }
  }

  return {
    tasksCompletedThisWeek,
    tasksOverdue,
    averageCompletionTimeHours: completedCount > 0 ? Math.round((totalHours / completedCount) * 10) / 10 : null,
    totalTasks,
    tasksByStatus: Object.fromEntries(tasksByStatus.map((s) => [s.status, s._count.id])),
    tasksByPriority: Object.fromEntries(tasksByPriority.map((p) => [p.priority, p._count.id])),
  };
}

export async function getOrgProductivityStats(organizationId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [activeUsers, totalTasks, completedThisWeek, overdueTasks] = await Promise.all([
    prisma.user.count({ where: { organizationId, isActive: true, deletedAt: null } }),
    prisma.task.count({ where: { project: { organizationId }, deletedAt: null } }),
    prisma.task.count({
      where: { project: { organizationId }, status: 'DONE', completedAt: { gte: startOfWeek }, deletedAt: null },
    }),
    prisma.task.count({
      where: {
        project: { organizationId },
        status: { not: 'DONE' },
        dueDate: { lt: now },
        deletedAt: null,
      },
    }),
  ]);

  const tasksByStatus = await prisma.task.groupBy({
    by: ['status'],
    where: { project: { organizationId }, deletedAt: null },
    _count: { id: true },
  });

  return {
    activeUsers,
    totalTasks,
    completedThisWeek,
    overdueTasks,
    tasksByStatus: Object.fromEntries(tasksByStatus.map((s) => [s.status, s._count.id])),
  };
}

export async function getTasksByStatusReport(projectId: string) {
  const tasks = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId, deletedAt: null },
    _count: { id: true },
  });
  return Object.fromEntries(tasks.map((t) => [t.status, t._count.id]));
}

export async function getOverdueTasksReport(organizationId: string) {
  return prisma.task.findMany({
    where: {
      project: { organizationId },
      status: { not: 'DONE' },
      dueDate: { lt: new Date() },
      deletedAt: null,
    },
    include: {
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 100,
  });
}

export async function getTasksByAssigneeReport(organizationId: string) {
  return prisma.taskAssignee.groupBy({
    by: ['userId'],
    where: { task: { project: { organizationId }, deletedAt: null } },
    _count: { taskId: true },
  });
}
