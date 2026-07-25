import type { Prisma } from '@generated/prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { id } = await params;
    const where: Prisma.TaskWhereInput =
      user.role === 'TEAM_MEMBER'
        ? { id, deletedAt: null, assignees: { some: { userId: user.id } } }
        : { id, deletedAt: null, project: { organizationId: user.organizationId } };

    const task = await prisma.task.findFirst({
      where,
      include: {
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        labels: { include: { label: true } },
        comments: {
          where: { deletedAt: null },
          include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
        attachments: { where: { deletedAt: null } },
        project: { select: { id: true, name: true, organizationId: true } },
        timeEntries: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const { updateTaskStatus } = await import('@/actions');
      const result = await updateTaskStatus(id, body.status);
      if (result.success) return NextResponse.json({ data: result.data });
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }

    const { updateTask } = await import('@/actions');
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) formData.append(key, value.join(','));
      else formData.append(key, value as string);
    });
    const result = await updateTask(id, formData);

    if (result.success) return NextResponse.json({ data: result.data });
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
