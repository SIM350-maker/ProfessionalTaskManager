import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'attachments:upload');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const body = await request.json();
    const { filename, originalName, mimeType, size, url, taskId, commentId } = body;

    if (!filename || !originalName || !mimeType || !size || !url || !taskId) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: filename, originalName, mimeType, size, url, taskId' },
      }, { status: 422 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        url,
        taskId,
        commentId: commentId || null,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json({ data: attachment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
