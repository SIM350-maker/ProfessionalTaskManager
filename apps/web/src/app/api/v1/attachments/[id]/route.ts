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
    const attachment = await prisma.attachment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!attachment) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Attachment not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: { url: attachment.url, filename: attachment.originalName, mimeType: attachment.mimeType, size: attachment.size } });
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
    const attachment = await prisma.attachment.findFirst({
      where: { id, uploadedBy: user.id },
    });

    if (!attachment) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Attachment not found' } }, { status: 404 });
    }

    await prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
