import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { getApiUser, handleApiError } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { createAttachmentSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, 'attachments:upload');
  if (rateLimited) return rateLimited;

  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAttachmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 422 });
    }
    const { filename, originalName, mimeType, size, url, taskId, commentId } = parsed.data;

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
