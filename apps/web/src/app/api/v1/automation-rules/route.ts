import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { getAutomationRulesByOrg, createAutomationRule, updateAutomationRule, deleteAutomationRule, TRIGGER_LABELS, ACTION_LABELS } from '@/services/automation';
import { createAutomationRuleSchema } from '@/lib/validation';
import { requireCsrfToken } from '@/lib/security/csrf';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'automation-rules:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const rules = user.organizationId ? await getAutomationRulesByOrg(user.organizationId) : [];

    return NextResponse.json({ data: rules });
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

    const csrfError = await requireCsrfToken(request);
    if (csrfError) return csrfError;

    const body = await request.json();
    const parsed = createAutomationRuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Organization required' } }, { status: 403 });
    }

    const rule = await createAutomationRule({
      ...parsed.data,
      organizationId: user.organizationId,
      createdBy: user.id,
    });

    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
