import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { buildTaskIcalFeed } from '@/lib/ical';

export const dynamic = 'force-dynamic';

/**
 * Public (token-authenticated, not session-authenticated) .ics feed of a user's
 * assigned tasks with due dates — subscribable from Google Calendar/Outlook/Apple
 * Calendar via plain URL, no OAuth needed. The token is an opaque per-user secret,
 * not the session cookie, since calendar clients fetch this server-to-server.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { calendarToken: token },
    select: { id: true, firstName: true, lastName: true, deletedAt: true, isActive: true },
  });

  if (!user || user.deletedAt || !user.isActive) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid calendar feed' } }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignees: { some: { userId: user.id } },
      dueDate: { not: null },
      deletedAt: null,
    },
    select: { id: true, title: true, description: true, dueDate: true, status: true },
    take: 500,
  });

  const ics = buildTaskIcalFeed(
    tasks.map((t) => ({ ...t, dueDate: t.dueDate as Date })),
    `${user.firstName} ${user.lastName} — Tasks`,
  );

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="tasks.ics"',
    },
  });
}
