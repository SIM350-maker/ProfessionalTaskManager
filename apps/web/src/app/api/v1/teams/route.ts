import type { Prisma } from '@generated/prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'teams:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { organizationId: user.organizationId, deletedAt: null };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
        where.id = { lt: decoded.id };
      } catch {
        // ignore invalid cursor
      }
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where: where as Prisma.TeamWhereInput,
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      }),
      prisma.team.count({ where: where as Prisma.TeamWhereInput }),
    ]);

    const hasNextPage = teams.length > limit;
    const data = hasNextPage ? teams.slice(0, limit) : teams;
    const lastItem = data[data.length - 1];

    return NextResponse.json({
      data,
      meta: {
        total,
        limit,
        cursor: lastItem ? Buffer.from(JSON.stringify({ id: lastItem.id })).toString('base64') : null,
        hasNextPage,
      },
    });
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
    const { createTeam } = await import('@/actions');
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as string);
      }
    });
    const result = await createTeam(formData);

    if (result.success) {
      return NextResponse.json({ data: result.data }, { status: 201 });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
