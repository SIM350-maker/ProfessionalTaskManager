"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { STATUS_LABELS } from "@/lib/constants";
import { getStatusColor } from "@/lib/helpers";

interface StatusDistributionProps {
  data: { status: string; count: number }[];
}

export function StatusDistribution({ data }: StatusDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>Task Distribution</CardHeader>
        <div className="flex items-center justify-center h-64 text-sm text-text-tertiary">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: getStatusColor(d.status),
  }));

  return (
    <Card>
      <CardHeader>Task Distribution</CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              animationBegin={200}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value, name) => [value as number, name as string]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
