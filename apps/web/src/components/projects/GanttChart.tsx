'use client';

import { useMemo, useState } from 'react';
import { cn, formatDate } from '@/lib/helpers';
import { STATUS_LABELS } from '@/lib/constants';

interface GanttAssignee {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

interface GanttTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  startDate: Date | string | null;
  dueDate: Date | string | null;
  assignees?: GanttAssignee[];
}

interface GanttChartProps {
  tasks: GanttTask[];
  projects?: { id: string; name: string }[];
}

const STATUS_BAR_COLORS: Record<string, string> = {
  TODO: 'bg-status-bar-todo',
  IN_PROGRESS: 'bg-status-bar-in_progress',
  IN_REVIEW: 'bg-status-bar-in_review',
  DONE: 'bg-status-bar-done',
  ARCHIVED: 'bg-status-bar-archived',
};

const STATUS_BAR_HOVER: Record<string, string> = {
  TODO: 'hover:opacity-80',
  IN_PROGRESS: 'hover:opacity-80',
  IN_REVIEW: 'hover:opacity-80',
  DONE: 'hover:opacity-80',
  ARCHIVED: 'hover:opacity-80',
};

const DAY_WIDTH = 36;
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 44;
const SIDEBAR_WIDTH = 280;

function toDate(v: Date | string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function GanttChart({ tasks }: GanttChartProps) {
  const [showTimeline, setShowTimeline] = useState(true);

  const { minDate, totalDays, timelineWidth, barRows, todayOffset, weekHeaders } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let min: Date | null = null;
    let max: Date | null = null;

    for (const t of tasks) {
      const sd = toDate(t.startDate);
      const dd = toDate(t.dueDate);
      if (sd && (!min || sd < min)) min = sd;
      if (dd) {
        if (!max || dd > max) max = dd;
      } else if (sd && (!max || sd > max)) {
        max = sd;
      }
    }

    if (!min) min = now;
    if (!max) max = addDays(now, 14);
    if (min > max) max = addDays(min, 14);

    min = addDays(min, -3);
    max = addDays(max, 3);

    const total = daysBetween(min, max) + 1;
    const width = total * DAY_WIDTH;

    const todayOff = daysBetween(min, now);

    const weeks: { label: string; left: number; width: number }[] = [];
    let cursor = new Date(min);
    while (cursor < max) {
      const weekStart = getMonday(cursor);
      const weekEnd = addDays(weekStart, 7);
      const left = daysBetween(min, weekStart) * DAY_WIDTH;
      const w = Math.min(daysBetween(weekStart, weekEnd), daysBetween(weekStart, max)) * DAY_WIDTH;
      weeks.push({ label: monthLabel(weekStart), left, width: Math.max(w, DAY_WIDTH) });
      cursor = addDays(weekStart, 7);
    }

    const rows = tasks.map((task) => {
      const sd = toDate(task.startDate) ?? now;
      const dd = toDate(task.dueDate) ?? addDays(sd, 1);
      const startOffset = Math.max(daysBetween(min, sd), 0) * DAY_WIDTH;
      const barW = Math.max(daysBetween(sd, dd), 0.5) * DAY_WIDTH;
      return {
        ...task,
        startOffset,
        barWidth: Math.max(barW, 8),
        startLabel: task.startDate ? formatDate(task.startDate) : '-',
        dueLabel: task.dueDate ? formatDate(task.dueDate) : '-',
      };
    });

    return {
      minDate: min,
      maxDate: max,
      totalDays: total,
      timelineWidth: width,
      barRows: rows,
      todayOffset: todayOff >= 0 && todayOff <= total ? todayOff * DAY_WIDTH : -1,
      weekHeaders: weeks,
    };
  }, [tasks]);

  const timelineHeight = Math.max(tasks.length * ROW_HEIGHT, 200);

  return (
    <div className="animate-fade-in overflow-hidden rounded-lg border border-border-default bg-bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Gantt Chart
          <span className="ml-2 text-xs font-normal text-text-secondary">({tasks.length} tasks)</span>
        </h3>
        <button
          onClick={() => setShowTimeline((v) => !v)}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-bg-hover lg:hidden"
        >
          {showTimeline ? 'Hide timeline' : 'View timeline'}
        </button>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Sidebar: Task list */}
        <div
          className="shrink-0 border-r border-border-default overflow-hidden"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Header spacer */}
          <div
            className="border-b border-border-default bg-bg-subtle px-3 flex items-center"
            style={{ height: HEADER_HEIGHT }}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Task</span>
          </div>
          {/* Rows */}
          <div style={{ height: timelineHeight, overflowY: 'auto' }}>
            {barRows.map((task) => (
              <div
                key={task.id}
                className="flex items-center border-b border-border-default/50 px-3 text-sm hover:bg-bg-subtle"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="min-w-0 flex-1 truncate font-medium text-text-primary">{task.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline panel */}
        <div
          className={cn('flex-1 overflow-x-auto', !showTimeline && 'hidden lg:block')}
        >
          <div style={{ minWidth: timelineWidth }}>
            {/* Header: day labels */}
            <div
              className="relative border-b border-border-default bg-bg-subtle"
              style={{ height: HEADER_HEIGHT }}
            >
              {/* Month/Week labels */}
              {weekHeaders.map((w, i) => {
                if (i === 0 || w.label !== weekHeaders[i - 1]?.label) {
                  return (
                    <div
                      key={w.left}
                      className="absolute top-0 text-[10px] font-medium text-text-tertiary px-1 leading-tight"
                      style={{ left: w.left }}
                    >
                      {w.label}
                    </div>
                  );
                }
                return null;
              })}
              {/* Day columns */}
              {Array.from({ length: totalDays }, (_, i) => {
                const d = addDays(minDate, i);
                const isToday = d.getTime() === new Date().setHours(0, 0, 0, 0);
                return (
                  <div
                    key={i}
                    className={cn(
                      'absolute bottom-0 border-r border-border-default/50 text-[10px] text-text-tertiary px-0.5 leading-none pb-0.5',
                      isToday && 'font-bold text-text-link',
                    )}
                    style={{ left: i * DAY_WIDTH, width: DAY_WIDTH, height: 16 }}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Rows with bars */}
            <div className="relative" style={{ height: timelineHeight }}>
              {/* Today marker */}
              {todayOffset >= 0 && (
                <div
                  className="absolute top-0 z-10 w-px bg-status-bar-today"
                  style={{ left: todayOffset, height: '100%' }}
                  title="Today"
                />
              )}
              {/* Grid lines */}
              {Array.from({ length: totalDays }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 border-r border-border-default/50"
                  style={{ left: i * DAY_WIDTH, height: '100%', width: DAY_WIDTH }}
                />
              ))}
              {/* Bars */}
              {barRows.map((task, idx) => (
                <div
                  key={task.id}
                  className="absolute flex items-center"
                  style={{
                    top: idx * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                    left: 0,
                    right: 0,
                  }}
                >
                  <div
                    className={cn(
                      'relative h-5 rounded px-1.5 text-xs font-medium leading-5 text-white transition-all hover:shadow-md hover:z-20',
                      STATUS_BAR_COLORS[task.status] || 'bg-status-bar-todo',
                      STATUS_BAR_HOVER[task.status] || 'hover:opacity-80',
                    )}
                    style={{
                      marginLeft: task.startOffset,
                      width: task.barWidth,
                      minWidth: 8,
                    }}
                    title={`${task.title} (${STATUS_LABELS[task.status] || task.status})\n${task.startLabel} → ${task.dueLabel}`}
                  >
                    {task.barWidth > 60 && (
                      <span className="truncate block">{task.title}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: full task list when timeline hidden */}
      {!showTimeline && (
        <div className="block lg:hidden">
          {barRows.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-border-default/50 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1 truncate font-medium text-text-primary">{task.title}</div>
              <div className="ml-3 flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    STATUS_BAR_COLORS[task.status] || 'bg-status-bar-todo',
                  )}
                />
                <span className="text-xs text-text-secondary">{task.startLabel}</span>
                <span className="text-xs text-text-tertiary/50">→</span>
                <span className="text-xs text-text-secondary">{task.dueLabel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
