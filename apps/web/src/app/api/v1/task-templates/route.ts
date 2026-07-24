import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { getTaskTemplatesByOrg, createTaskTemplate, updateTaskTemplate, deleteTaskTemplate } from '@/services/task-templates';
import { createTaskTemplateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'task-templates:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const templates = await getTaskTemplatesByOrg(user.organizationId);

    return NextResponse.json({ data: templates });
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
    const parsed = createTaskTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }

    const template = await createTaskTemplate({
      ...parsed.data,
      organizationId: user.organizationId,
      createdBy: user.id,
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
