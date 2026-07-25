import { NextResponse } from 'next/server';
import { getApiUser, handleApiError } from '@/lib/api-auth';

export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { markAllNotificationsRead } = await import('@/actions');
    const result = await markAllNotificationsRead();

    if (result.success) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
