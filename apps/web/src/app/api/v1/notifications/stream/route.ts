import type { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POLL_INTERVAL_MS = 3000;
const HEARTBEAT_INTERVAL_MS = 15000;

/**
 * Server-Sent Events feed for a user's notifications. Polls the DB on a short
 * interval and only pushes to the client when the unread count or notification
 * list actually changed, replacing the previous 15-30s client-side polling.
 */
export async function GET(request: NextRequest) {
  const apiUser = await getApiUser();
  if (!apiUser) {
    return new Response('Unauthorized', { status: 401 });
  }
  const user = apiUser;

  const encoder = new TextEncoder();
  let lastSignature = '';

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      async function poll() {
        try {
          const [unreadCount, notifications] = await Promise.all([
            prisma.notification.count({ where: { userId: user.id, isRead: false, deletedAt: null } }),
            prisma.notification.findMany({
              where: { userId: user.id, deletedAt: null },
              include: { actor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
              orderBy: { createdAt: 'desc' },
              take: 20,
            }),
          ]);

          const signature = JSON.stringify({ unreadCount, rows: notifications.map((n) => `${n.id}:${n.isRead}`) });
          if (signature !== lastSignature) {
            lastSignature = signature;
            send('notifications', { unreadCount, notifications });
          }
        } catch (error) {
          console.error('Notification stream poll failed:', error);
        }
      }

      await poll();
      const pollTimer = setInterval(poll, POLL_INTERVAL_MS);
      const heartbeatTimer = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, HEARTBEAT_INTERVAL_MS);

      request.signal.addEventListener('abort', () => {
        clearInterval(pollTimer);
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
