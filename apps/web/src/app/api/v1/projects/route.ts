import type { Prisma } from '@generated/prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'projects:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const cursor = searchParams.get('cursor');

    const where: Record<string, unknown> = { organizationId: user.organizationId, deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
        where.createdAt = { lt: new Date(decoded.createdAt) };
      } catch {
        // ignore invalid cursor
      }
    }

    const projects = await prisma.project.findMany({
      where: where as Prisma.ProjectWhereInput,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasNextPage = projects.length > limit;
    const data = hasNextPage ? projects.slice(0, limit) : projects;
    const lastItem = data[data.length - 1];

    return NextResponse.json({
      data,
      meta: {
        limit,
        cursor: lastItem ? Buffer.from(JSON.stringify({ createdAt: lastItem.createdAt.toISOString() })).toString('base64') : null,
        hasNextPage,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
