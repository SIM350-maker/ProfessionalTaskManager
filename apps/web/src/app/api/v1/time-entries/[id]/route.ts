import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
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

    const entry = await prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } }, { status: 404 });
    }

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(body.startTime !== undefined && { startTime: new Date(body.startTime) }),
        ...(body.endTime !== undefined && { endTime: body.endTime ? new Date(body.endTime) : null }),
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

    const entry = await prisma.timeEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } }, { status: 404 });
    }

    await prisma.timeEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
