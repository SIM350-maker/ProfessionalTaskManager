import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { hasPermission } from '@/lib/auth';

/**
 * Minimal org-member list for assignment pickers (bulk task assign, etc.) — gated
 * by task:update rather than the admin-only /api/v1/users route, since managers
 * legitimately need this to assign work without seeing the full admin user list.
 */
export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    if (!hasPermission(user.role, 'task:update')) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId, deletedAt: null, isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    return handleApiError(error);
  }
}
