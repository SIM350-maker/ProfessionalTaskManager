import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime()) && d < new Date();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.charAt(0)}***@${domain}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function buildCursorPaginationMeta<T extends { id: string }>(
  items: T[],
  total: number,
  limit: number,
) {
  const hasNextPage = items.length > limit;
  const displayItems = hasNextPage ? items.slice(0, limit) : items;
  const lastItem = displayItems[displayItems.length - 1];
  return {
    total,
    limit,
    cursor: lastItem ? Buffer.from(JSON.stringify({ id: lastItem.id })).toString('base64') : undefined,
    hasNextPage,
  };
}

export function parseCursor(cursor: string): { id: string } | null {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch {
    return null;
  }
}

export function getDashboardGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getDaysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getChartColor(index: number): string {
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#f43f5e', '#f97316'];
  return colors[index % colors.length]!;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    TODO: '#94a3b8',
    IN_PROGRESS: '#3b82f6',
    IN_REVIEW: '#f59e0b',
    DONE: '#22c55e',
    ARCHIVED: '#64748b',
  };
  return map[status] ?? '#94a3b8';
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    LOW: '#94a3b8',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    URGENT: '#ef4444',
  };
  return map[priority] ?? '#94a3b8';
}

/**
 * Server actions in this app return either `{ message: string }` or a Zod
 * `.flatten()` result (`{ formErrors, fieldErrors }`) as their `error` payload.
 * This extracts a human-readable message from either shape instead of the
 * generic string forms previously hardcoded at each call site.
 */
export function getActionErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error || typeof error !== 'object') return fallback;
  const err = error as { message?: string; formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> };

  if (typeof err.message === 'string' && err.message) return err.message;

  const fieldMessages = err.fieldErrors
    ? Object.entries(err.fieldErrors).flatMap(([field, messages]) => (messages ?? []).map((m) => `${field}: ${m}`))
    : [];
  const combined = [...(err.formErrors ?? []), ...fieldMessages];

  return combined.length > 0 ? combined.join('; ') : fallback;
}

export function getInitialsColor(name: string): string {
  const colors = ['bg-accent-blue-light text-accent-blue', 'bg-accent-purple-light text-accent-purple', 'bg-accent-cyan-light text-accent-cyan', 'bg-accent-amber-light text-accent-amber', 'bg-accent-green-light text-accent-green', 'bg-accent-rose-light text-accent-rose'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}