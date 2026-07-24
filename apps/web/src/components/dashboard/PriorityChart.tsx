"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { PRIORITY_LABELS } from "@/lib/constants";
import { getPriorityColor } from "@/lib/helpers";

interface PriorityChartProps {
  data: { priority: string; count: number }[];
}

export function PriorityChart({ data }: PriorityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>Priority Breakdown</CardHeader>
        <div className="flex items-center justify-center h-48 text-sm text-text-tertiary">No data</div>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: PRIORITY_LABELS[d.priority] ?? d.priority,
    value: d.count,
    fill: getPriorityColor(d.priority),
  }));

  const priorityOrder = ["URGENT", "HIGH", "MEDIUM", "LOW"];
  chartData.sort((a, b) => priorityOrder.indexOf(a.name.toUpperCase()) - priorityOrder.indexOf(b.name.toUpperCase()));

  return (
    <Card>
      <CardHeader>Priority Breakdown</CardHeader>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} tickLine={false} axisLine={false} width={70} />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
