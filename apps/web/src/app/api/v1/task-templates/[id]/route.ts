import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { updateTaskTemplate, deleteTaskTemplate } from '@/services/task-templates';
import { updateTaskTemplateSchema } from '@/lib/validation';
import { requireCsrfToken } from '@/lib/security/csrf';

async function findScopedTemplate(id: string, organizationId: string) {
  return prisma.taskTemplate.findFirst({
    where: { id, organizationId, deletedAt: null },
  });
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
    if (!['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const csrfError = await requireCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    if (!user.organizationId) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Organization required' } }, { status: 403 });
    }
    const existing = await findScopedTemplate(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task template not found' } }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateTaskTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const template = await updateTaskTemplate(id, parsed.data);
    return NextResponse.json({ data: template });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    if (!['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const csrfError = await requireCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    if (!user.organizationId) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Organization required' } }, { status: 403 });
    }
    const existing = await findScopedTemplate(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task template not found' } }, { status: 404 });
    }

    await deleteTaskTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
