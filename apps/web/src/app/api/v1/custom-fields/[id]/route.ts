import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { updateCustomField, deleteCustomField } from '@/services/custom-fields';
import { updateCustomFieldSchema } from '@/lib/validation';
import { requireCsrfToken } from '@/lib/security/csrf';

async function findScopedField(id: string, organizationId: string) {
  return prisma.customFieldDefinition.findFirst({
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
    const existing = await findScopedField(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Custom field not found' } }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCustomFieldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const { entityType: _entityType, projectId: _projectId, ...updateData } = parsed.data;
    const field = await updateCustomField(id, updateData);

    return NextResponse.json({ data: field });
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
    const existing = await findScopedField(id, user.organizationId);
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Custom field not found' } }, { status: 404 });
    }

    await deleteCustomField(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
