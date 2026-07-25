"use client";

import { useState } from "react";
import { BarChart, Bar, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/helpers";

interface ProductivityChartProps {
  data: { date: string; count: number }[];
  granularity?: "day" | "week" | "month";
  title?: string;
}

type ChartType = "area" | "bar";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const first = payload?.[0];
  if (active && first) {
    return (
      <div className="rounded-lg border border-border-default bg-bg-card px-3 py-2 shadow-dropdown text-sm">
        <p className="text-text-secondary">{label}</p>
        <p className="font-semibold text-text-primary">{first.value} tasks completed</p>
      </div>
    );
  }
  return null;
}

export function ProductivityChart({ data, granularity = "day", title = "Productivity" }: ProductivityChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  return (
    <Card>
      <CardHeader>
        <span>{title}</span>
        <div className="flex rounded-lg border border-border-default overflow-hidden">
          <button
            onClick={() => setChartType("area")}
            className={cn("px-3 py-1 text-xs font-medium transition-colors", chartType === "area" ? "bg-accent-blue text-white" : "bg-bg-card text-text-secondary hover:bg-bg-hover")}
          >
            Area
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={cn("px-3 py-1 text-xs font-medium transition-colors", chartType === "bar" ? "bg-accent-blue text-white" : "bg-bg-card text-text-secondary hover:bg-bg-hover")}
          >
            Bar
          </button>
        </div>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="var(--color-accent-blue)" strokeWidth={2} fill="url(#colorCount)" animationDuration={800} />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--color-accent-blue)" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
