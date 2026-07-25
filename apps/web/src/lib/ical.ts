interface IcalTask {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date;
  status: string;
}

function escapeIcalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Builds an RFC 5545 .ics calendar feed from a user's tasks. Each task with a
 * due date becomes an all-day-ish VEVENT so it can be subscribed to from Google
 * Calendar, Outlook, or Apple Calendar via a plain URL — no OAuth required.
 */
export function buildTaskIcalFeed(tasks: IcalTask[], calendarName: string): string {
  const now = toIcalDate(new Date());

  const events = tasks.map((task) => {
    const dtstamp = toIcalDate(task.dueDate);
    return [
      'BEGIN:VEVENT',
      `UID:task-${task.id}@professional-task-manager`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtstamp}`,
      `DTEND:${dtstamp}`,
      `SUMMARY:${escapeIcalText(task.title)}`,
      task.description ? `DESCRIPTION:${escapeIcalText(task.description)}` : null,
      `STATUS:${task.status === 'DONE' ? 'CONFIRMED' : 'NEEDS-ACTION'}`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Professional Task Manager//Calendar Feed//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcalText(calendarName)}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}
