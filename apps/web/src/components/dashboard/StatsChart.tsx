'use client';

import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/helpers';

interface StatsChartProps {
  data: Record<string, unknown>[];
  type: 'bar' | 'pie' | 'line';
  title?: string;
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  className?: string;
  height?: number;
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function StatsChart({
  data,
  type,
  title,
  xKey = 'name',
  yKey = 'value',
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_COLORS,
  className,
  height = 300,
}: StatsChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridColor = isDark ? '#2d3148' : '#E5E7EB';
  const tickColor = isDark ? '#94a3b8' : '#6B7280';
  const tooltipBg = isDark ? '#1a1d27' : '#ffffff';
  const tooltipBorder = isDark ? '#2d3148' : '#E5E7EB';
  const tooltipShadow = isDark ? '0 4px 6px -1px rgba(0,0,0,0.4)' : '0 4px 6px -1px rgba(0,0,0,0.1)';

  function renderChart() {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: `1px solid ${tooltipBorder}`,
                backgroundColor: tooltipBg,
                boxShadow: tooltipShadow,
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: `1px solid ${tooltipBorder}`,
                backgroundColor: tooltipBg,
                boxShadow: tooltipShadow,
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px', color: isDark ? '#f1f5f9' : '#0f172a' }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: gridColor }} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: `1px solid ${tooltipBorder}`,
                backgroundColor: tooltipBg,
                boxShadow: tooltipShadow,
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: colors[0] }}
            />
          </LineChart>
        );
    }
  }

  return (
    <div className={cn('rounded-lg border border-border-default bg-bg-card p-4', className)}>
      {title && <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
