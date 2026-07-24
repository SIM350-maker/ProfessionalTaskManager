import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'analytics:overview');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const orgId = user.organizationId;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTasks,
      tasksByStatus,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      overdueTasks,
      totalProjects,
      totalTeamMembers,
      totalTimeEntries,
    ] = await Promise.all([
      prisma.task.count({ where: { project: { organizationId: orgId }, deletedAt: null } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { organizationId: orgId }, deletedAt: null },
        _count: true,
      }),
      prisma.task.count({
        where: {
          project: { organizationId: orgId },
          status: 'DONE',
          completedAt: { gte: startOfWeek },
          deletedAt: null,
        },
      }),
      prisma.task.count({
        where: {
          project: { organizationId: orgId },
          status: 'DONE',
          completedAt: { gte: startOfMonth },
          deletedAt: null,
        },
      }),
      prisma.task.count({
        where: {
          project: { organizationId: orgId },
          dueDate: { lt: now },
          status: { notIn: ['DONE', 'ARCHIVED'] },
          deletedAt: null,
        },
      }),
      prisma.project.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.user.count({ where: { organizationId: orgId, isActive: true, deletedAt: null } }),
      prisma.timeEntry.count({ where: { organizationId: orgId } }),
    ]);

    return NextResponse.json({
      data: {
        totalTasks,
        tasksByStatus: tasksByStatus.reduce((acc, cur) => {
          acc[cur.status] = cur._count;
          return acc;
        }, {} as Record<string, number>),
        tasksCompletedThisWeek,
        tasksCompletedThisMonth,
        overdueTasks,
        totalProjects,
        totalTeamMembers,
        totalTimeEntries,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
