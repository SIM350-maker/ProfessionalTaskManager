import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { getCustomFieldsByOrg, createCustomField, updateCustomField, deleteCustomField } from '@/services/custom-fields';
import { requireCsrfToken } from '@/lib/security/csrf';
import { createCustomFieldSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'customFields:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || 'TASK';
    const projectId = searchParams.get('projectId') || undefined;

    const fields = user.organizationId ? await getCustomFieldsByOrg(user.organizationId, entityType, projectId) : [];

    return NextResponse.json({ data: fields });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user || !user.organizationId || !['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const csrfError = await requireCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createCustomFieldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const field = await createCustomField({
      ...parsed.data,
      organizationId: user.organizationId,
    });

    return NextResponse.json({ data: field }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
