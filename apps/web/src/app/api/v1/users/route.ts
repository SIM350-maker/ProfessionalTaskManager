import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { maskEmail } from '@/lib/helpers';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'users:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    if (user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        lastLoginAt: true,
        organizationId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const maskedUsers = users.map((u) => ({
      ...u,
      email: maskEmail(u.email),
    }));

    return NextResponse.json({ data: maskedUsers });
  } catch (error) {
    return handleApiError(error);
  }
}
