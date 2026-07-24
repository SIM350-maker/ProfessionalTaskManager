import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { isOverdue } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireAuth();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const baseData: Record<string, unknown> = {
    user,
    role: user.role,
  };

  if (user.role === 'ADMINISTRATOR') {
    const [totalUsers, totalProjects, allTasks, stats, recentUsers, totalTaskCount, priorityStats, projectsWithTasks, orgCompletionData] = await Promise.all([
      prisma.user.count({ where: { organizationId: user.organizationId, deletedAt: null } }),
      prisma.project.count({ where: { organizationId: user.organizationId, deletedAt: null } }),
      prisma.task.findMany({
        where: { project: { organizationId: user.organizationId }, deletedAt: null },
        include: {
          project: { select: { id: true, name: true } },
          assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { organizationId: user.organizationId }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.user.findMany({
        where: { organizationId: user.organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
      prisma.task.count({ where: { project: { organizationId: user.organizationId }, deletedAt: null } }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { project: { organizationId: user.organizationId }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.project.findMany({
        where: { organizationId: user.organizationId, deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
          tasks: { where: { deletedAt: null }, select: { status: true } },
        },
      }),
      prisma.task.findMany({
        where: { project: { organizationId: user.organizationId }, status: 'DONE', completedAt: { gte: thirtyDaysAgo }, deletedAt: null },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
    ]);

    const active = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const statusData = stats.map((s) => ({ status: s.status, count: s._count.id }));
    const priorityData = priorityStats.map((s) => ({ priority: s.priority, count: s._count.id }));
    const completedCount = stats.find((s) => s.status === 'DONE')?._count.id ?? 0;
    const projectProgressData = projectsWithTasks.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      totalTasks: p.tasks.length,
      completedTasks: p.tasks.filter((t) => t.status === 'DONE').length,
    }));

    const dailyCounts = new Map<string, number>();
    for (const t of orgCompletionData) {
      if (t.completedAt) {
        const key = t.completedAt.toISOString().slice(0, 10);
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }
    }
    const productivityData = Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }));

    Object.assign(baseData, {
      totalUsers, totalProjects, totalTaskCount, active, recentUsers, allTasks, statusData, priorityData, projectProgressData, productivityData, completedCount,
    });
  }

  if (user.role === 'MANAGER') {
    const projectIds = await prisma.project.findMany({
      where: { ownerId: user.id, deletedAt: null },
      select: { id: true },
    });
    const managedProjectIds = projectIds.map((p) => p.id);

    const [myTasks, managedTasks, stats, completionData, projects, priorityStats] = await Promise.all([
      prisma.task.findMany({
        where: { assignees: { some: { userId: user.id } }, deletedAt: null },
        include: { project: { select: { id: true, name: true } }, assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } } },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
      prisma.task.findMany({
        where: managedProjectIds.length > 0 ? { projectId: { in: managedProjectIds }, deletedAt: null } : { id: '' },
        include: { project: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: managedProjectIds.length > 0 ? { projectId: { in: managedProjectIds }, deletedAt: null } : { id: '' },
        _count: { id: true },
      }),
      prisma.task.findMany({
        where: { assignees: { some: { userId: user.id } }, status: 'DONE', completedAt: { gte: thirtyDaysAgo }, deletedAt: null },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.project.findMany({
        where: { ownerId: user.id, deletedAt: null },
        select: { id: true, name: true, status: true, _count: { select: { tasks: true } } },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: managedProjectIds.length > 0 ? { projectId: { in: managedProjectIds }, deletedAt: null } : { id: '' },
        _count: { id: true },
      }),
    ]);

    const overdue = myTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'DONE');
    const statusData = stats.map((s) => ({ status: s.status, count: s._count.id }));
    const priorityData = priorityStats.map((s) => ({ priority: s.priority, count: s._count.id }));

    const dailyCounts = new Map<string, number>();
    for (const t of completionData) {
      if (t.completedAt) {
        const key = t.completedAt.toISOString().slice(0, 10);
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }
    }
    const productivityData = Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }));

    const totalManagedTasks = managedTasks.length + myTasks.length;
    const completedManagedTasks = stats.find((s) => s.status === 'DONE')?._count.id ?? 0;

    Object.assign(baseData, {
      myTasks, managedTasks, projects, managedProjectIds, statusData, priorityData, productivityData, completedManagedTasks, totalManagedTasks, overdueTasks: overdue,
    });
  }

  if (user.role === 'TEAM_MEMBER') {
    const [tasks, stats, completionData, priorityStats] = await Promise.all([
      prisma.task.findMany({
        where: { assignees: { some: { userId: user.id } }, deletedAt: null },
        include: {
          project: { select: { id: true, name: true } },
          assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
        take: 20,
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { assignees: { some: { userId: user.id } }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.task.findMany({
        where: {
          assignees: { some: { userId: user.id } },
          status: 'DONE',
          completedAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { assignees: { some: { userId: user.id } }, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'DONE');
    const myActiveTasks = tasks.filter((t) => t.status !== 'DONE' && t.status !== 'ARCHIVED');
    const completedTasks = tasks.filter((t) => t.status === 'DONE');

    const statusData = stats.map((s) => ({ status: s.status, count: s._count.id }));
    const priorityData = priorityStats.map((s) => ({ priority: s.priority, count: s._count.id }));
    const completedCount = stats.find((s) => s.status === 'DONE')?._count.id ?? 0;

    const dailyCounts = new Map<string, number>();
    for (const t of completionData) {
      if (t.completedAt) {
        const key = t.completedAt.toISOString().slice(0, 10);
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }
    }
    const productivityData = Array.from(dailyCounts.entries()).map(([date, count]) => ({ date, count }));

    Object.assign(baseData, {
      tasks, statusData, priorityData, completedCount, productivityData, overdueTasks, myActiveTasks, completedTasks,
    });
  }

  return <DashboardClient data={baseData as never} />;
}
