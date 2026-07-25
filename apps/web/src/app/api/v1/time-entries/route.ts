import type { Prisma } from '@generated/prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { createTimeEntrySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'time-entries:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);

    const where: Record<string, unknown> = { organizationId: user.organizationId };

    if (taskId) where.taskId = taskId;
    if (userId) where.userId = userId;
    if (startDate) where.startTime = { ...(where.startTime as object || {}), gte: new Date(startDate) };
    if (endDate) where.endTime = { ...(where.endTime as object || {}), lte: new Date(endDate) };

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
        where.id = { lt: decoded.id };
      } catch {
        // ignore invalid cursor
      }
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where: where as Prisma.TimeEntryWhereInput,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { startTime: 'desc' },
        take: limit + 1,
      }),
      prisma.timeEntry.count({ where: where as Prisma.TimeEntryWhereInput }),
    ]);

    const hasNextPage = entries.length > limit;
    const data = hasNextPage ? entries.slice(0, limit) : entries;
    const lastItem = data[data.length - 1];

    return NextResponse.json({
      data,
      meta: {
        total,
        limit,
        cursor: lastItem ? Buffer.from(JSON.stringify({ id: lastItem.id })).toString('base64') : null,
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

    const body = await request.json();
    const parsed = createTimeEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }
    const { taskId, startTime, endTime, description } = parsed.data;

    const entry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId: user.id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description: description || null,
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
