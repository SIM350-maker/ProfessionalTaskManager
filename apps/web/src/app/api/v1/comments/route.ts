import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'comments:create');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const body = await request.json();
    const { addComment } = await import('@/actions');
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const result = await addComment(body.taskId, formData);

    if (result.success) {
      return NextResponse.json({ data: result.data }, { status: 201 });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
