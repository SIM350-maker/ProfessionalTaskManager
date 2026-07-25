import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { updateWorkflow, deleteWorkflow } from '@/services/workflows';
import { updateWorkflowSchema } from '@/lib/validation';
import { requireCsrfToken } from '@/lib/security/csrf';

async function findScopedWorkflow(id: string, organizationId: string) {
  return prisma.workflow.findFirst({
    where: { id, organizationId, deletedAt: null },
  });
}

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
    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId: user.organizationId, deletedAt: null },
      include: { states: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!workflow) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: workflow });
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
    if (!['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const csrfError = await requireCsrfToken(request);
    if (csrfError) return csrfError;

    const { id } = await params;
    const existing = await findScopedWorkflow(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const workflow = await updateWorkflow(id, parsed.data);
    return NextResponse.json({ data: workflow });
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
    const existing = await findScopedWorkflow(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } }, { status: 404 });
    }

    await deleteWorkflow(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
