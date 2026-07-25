import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const { id } = await params;
    const team = await prisma.team.findFirst({
      where: { id, organizationId: user.organizationId, deletedAt: null },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true, jobTitle: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    const team = await prisma.team.findFirst({
      where: { id, organizationId: user.organizationId, deletedAt: null },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } }, { status: 404 });
    }

    const updated = await prisma.team.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({ data: updated });
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

    const team = await prisma.team.findFirst({
      where: { id, organizationId: user.organizationId, deletedAt: null },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Team not found' } }, { status: 404 });
    }

    const { deleteTeam } = await import('@/actions');
    const result = await deleteTeam(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  } catch (error) {
    return handleApiError(error);
  }
}
