'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/helpers';

interface HeatmapProps {
  data: { date: string; value: number }[];
  startDate: Date;
  endDate: Date;
  title?: string;
  subtitle?: string;
  cellSize?: number;
  gap?: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColor(value: number, max: number): string {
  if (value === 0) return 'bg-bg-hover';
  const intensity = value / max;
  if (intensity < 0.25) return 'bg-accent-blue-light';
  if (intensity < 0.5) return 'bg-accent-blue/40';
  if (intensity < 0.75) return 'bg-accent-blue/70';
  return 'bg-accent-blue';
}

export function Heatmap({ data, startDate, endDate, title, subtitle, cellSize = 12, gap = 3 }: HeatmapProps) {
  const { weeks, maxValue, monthLabels } = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, item.value);
    }

    const weeks: { date: Date; value: number }[][] = [];
    let currentWeek: { date: Date; value: number }[] = [];
    let cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);

    const dayOfWeek = cursor.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: new Date(cursor), value: 0 });
    }

    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);
      currentWeek.push({ date: new Date(cursor), value: map.get(key) || 0 });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(cursor), value: 0 });
      }
      weeks.push(currentWeek);
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);

    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const firstDay = week.find((d) => d.value > 0 || d.date.getTime() <= endDate.getTime());
      if (firstDay && firstDay.date.getMonth() !== lastMonth) {
        months.push({ label: MONTH_LABELS[firstDay.date.getMonth()] ?? '', weekIndex: i });
        lastMonth = firstDay.date.getMonth();
      }
    });

    return { weeks, maxValue: max, monthLabels: months };
  }, [data, startDate, endDate]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title || 'Activity Heatmap'}</h3>
            {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <span>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className={cn('rounded-sm', getColor(intensity * maxValue, maxValue))}
                style={{ width: cellSize, height: cellSize }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full">
            <div className="flex flex-col gap-[2px] pr-2">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="flex h-[18px] items-center text-[10px] text-text-tertiary"
                  style={{ marginTop: i === 0 ? cellSize + gap : 0 }}
                >
                  {i % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-[2px]">
              <div className="flex gap-[2px]">
                {monthLabels.map(({ label, weekIndex }) => (
                  <div
                    key={label}
                    className="text-[10px] text-text-tertiary"
                    style={{
                      position: 'absolute',
                      marginLeft: weekIndex * (cellSize + gap),
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map((day, dayIndex) => {
                      const isFuture = day.date > new Date();
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'rounded-sm transition-colors',
                            isFuture ? 'bg-bg-hover opacity-30' : getColor(day.value, maxValue),
                          )}
                          style={{ width: cellSize, height: cellSize }}
                          title={`${day.date.toISOString().slice(0, 10)}: ${day.value} tasks`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
          <span>{total.toLocaleString()} total tasks</span>
          <span>{weeks.length} weeks</span>
        </div>
      </CardContent>
    </Card>
  );
}
