'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/helpers';
import { STATUS_LABELS } from '@/lib/constants';

interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  assignees?: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }[];
}

interface CalendarViewProps {
  tasks: CalendarTask[];
  onTaskClick?: (task: CalendarTask) => void;
}

const STATUS_DOT_COLORS: Record<string, string> = {
  TODO: 'bg-text-tertiary',
  IN_PROGRESS: 'bg-accent-blue',
  IN_REVIEW: 'bg-accent-amber',
  DONE: 'bg-accent-green',
  ARCHIVED: 'bg-text-tertiary',
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  TODO: 'bg-bg-hover text-text-primary',
  IN_PROGRESS: 'bg-accent-blue-light text-accent-blue',
  IN_REVIEW: 'bg-accent-amber-light text-accent-amber',
  DONE: 'bg-accent-green-light text-accent-green',
  ARCHIVED: 'bg-bg-hover text-text-tertiary',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDate(v: Date | string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { days, tasksByDate } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const daysArray: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      daysArray.push(new Date(currentYear, currentMonth, d));
    }
    while (daysArray.length % 7 !== 0) {
      daysArray.push(null);
    }

    const byDate: Record<string, CalendarTask[]> = {};
    for (const task of tasks) {
      const dd = toDate(task.dueDate);
      if (!dd) continue;
      const key = `${dd.getFullYear()}-${dd.getMonth()}-${dd.getDate()}`;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(task);
    }

    return { days: daysArray, tasksByDate: byDate };
  }, [tasks, currentMonth, currentYear]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return [];
    const key = `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`;
    return tasksByDate[key] || [];
  }, [selectedDay, tasksByDate]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  function goToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today);
  }

  function handleDayClick(day: Date) {
    setSelectedDay((prev) => (prev && isSameDay(prev, day) ? null : day));
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="animate-fade-in rounded-lg border border-border-default bg-bg-card">
      {/* Header: Navigation */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="rounded-md p-1.5 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="min-w-[180px] text-center text-base font-semibold text-text-primary">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-md p-1.5 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-md px-3 py-1 text-xs font-medium text-text-link hover:bg-accent-blue-light"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {/* Day name headers */}
        <div className="mb-1 grid grid-cols-7">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-1 text-center text-xs font-medium uppercase text-text-secondary">
              {name}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={`empty-${wi}-${di}`} className="min-h-[80px]" />;
                }

                const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                const dayTasks = tasksByDate[key] || [];
                const isToday = isSameDay(day, today);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isOtherMonth = day.getMonth() !== currentMonth;

                return (
                  <button
                    key={key}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      'relative flex min-h-[80px] flex-col rounded-md border p-1 text-left transition-colors',
                      isSelected && 'border-accent-blue bg-accent-blue-light',
                      !isSelected && isToday && 'border-accent-blue bg-accent-blue-light/50',
                      !isSelected && !isToday && 'border-transparent hover:border-border-default hover:bg-bg-subtle',
                      isOtherMonth && 'opacity-40',
                    )}
                  >
                    <span
                      className={cn(
                        'mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday && !isSelected && 'bg-accent-blue text-text-inverse',
                        isSelected && 'bg-accent-blue text-text-inverse',
                        !isToday && !isSelected && 'text-text-primary',
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-0.5">
                        {dayTasks.slice(0, 3).map((task) => (
                          <span
                            key={task.id}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              STATUS_DOT_COLORS[task.status] || 'bg-text-tertiary',
                            )}
                            title={task.title}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[10px] font-medium text-text-tertiary leading-none">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected day tasks panel */}
      {selectedDay && (
        <div className="border-t border-border-default px-4 py-3">
          <h4 className="mb-2 text-sm font-semibold text-text-primary">
            Tasks for {formatDate(selectedDay)}
          </h4>
          {selectedDayTasks.length === 0 ? (
            <p className="py-2 text-center text-sm text-text-tertiary">No tasks due on this day.</p>
          ) : (
            <div className="space-y-1.5">
              {selectedDayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="flex w-full items-center gap-2 rounded-md border border-border-default/50 px-3 py-2 text-left text-sm transition-colors hover:border-border-default hover:bg-bg-subtle"
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      STATUS_DOT_COLORS[task.status] || 'bg-text-tertiary',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-text-primary">
                    {task.title}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                      STATUS_BADGE_COLORS[task.status] || 'bg-bg-hover text-text-secondary',
                    )}
                  >
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
