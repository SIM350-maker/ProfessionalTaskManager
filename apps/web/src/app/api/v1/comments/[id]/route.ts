import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUser, handleApiError } from '@/lib/api-auth';

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
    const { updateComment } = await import('@/actions');
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    const result = await updateComment(id, formData);

    if (result.success) {
      return NextResponse.json({ data: result.data });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
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

    const { id } = await params;
    const { deleteComment } = await import('@/actions');
    const result = await deleteComment(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
