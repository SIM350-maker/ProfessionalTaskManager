import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { createLabelSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'labels:list');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const labels = await prisma.label.findMany({
      where: { organizationId: user.organizationId, deletedAt: null },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: labels });
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
    const parsed = createLabelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }
    const { name, color } = parsed.data;

    const existing = await prisma.label.findFirst({
      where: { name, organizationId: user.organizationId, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: { code: 'CONFLICT', message: 'A label with this name already exists' },
      }, { status: 409 });
    }

    const label = await prisma.label.create({
      data: {
        name,
        color: color || '#6b7280',
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({ data: label }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
