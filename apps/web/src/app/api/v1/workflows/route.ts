import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { getWorkflowsByOrg, createWorkflow, updateWorkflow, deleteWorkflow } from '@/services/workflows';
import { createWorkflowSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'workflows:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || 'TASK';

    const workflows = await getWorkflowsByOrg(user.organizationId, entityType);

    return NextResponse.json({ data: workflows });
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
    const parsed = createWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const workflow = await createWorkflow({
      ...parsed.data,
      organizationId: user.organizationId,
    });

    return NextResponse.json({ data: workflow }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
