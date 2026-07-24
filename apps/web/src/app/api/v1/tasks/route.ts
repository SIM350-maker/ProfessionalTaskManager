import type { Prisma } from '@generated/prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'tasks:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Record<string, unknown> = { deletedAt: null };

    if (user.role === 'TEAM_MEMBER') {
      where.assignees = { some: { userId: user.id } };
    } else {
      where.project = { organizationId: user.organizationId };
    }

    if (status) where.status = { in: status.split(',') };
    if (priority) where.priority = { in: priority.split(',') };
    if (projectId) where.projectId = projectId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
        where[sortBy] = sortOrder === 'desc' ? { lt: decoded[sortBy] } : { gt: decoded[sortBy] };
      } catch {
        // ignore invalid cursor
      }
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: where as Prisma.TaskWhereInput,
        include: {
          assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
          project: { select: { id: true, name: true } },
        },
        orderBy,
        take: limit + 1,
      }),
      prisma.task.count({ where: where as Prisma.TaskWhereInput }),
    ]);

    const hasNextPage = tasks.length > limit;
    const data = hasNextPage ? tasks.slice(0, limit) : tasks;
    const lastItem = data[data.length - 1];

    return NextResponse.json({
      data,
      meta: {
        total,
        limit,
        cursor: lastItem ? Buffer.from(JSON.stringify({ [sortBy]: lastItem[sortBy as keyof typeof lastItem], id: lastItem.id })).toString('base64') : null,
        hasNextPage,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    if (!['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const body = await request.json();
    const { createTask } = await import('@/actions');
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else {
        formData.append(key, value as string);
      }
    });
    const result = await createTask(formData);

    if (result.success) {
      return NextResponse.json({ data: result.data }, { status: 201 });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
