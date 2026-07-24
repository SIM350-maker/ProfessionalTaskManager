"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/helpers";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  color?: string;
  subtitle?: string;
  delay?: number;
}

export function KpiCard({ label, value, icon, trend, color, subtitle, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border-default bg-bg-card p-5 shadow-kpi hover:shadow-hover transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color ? `${color}/10` : "bg-accent-blue-light")}>
          <span className={cn("h-5 w-5", color || "text-accent-blue")}>{icon}</span>
        </div>
        {trend && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
            trend.isUp ? "bg-accent-green-light text-accent-green" : "bg-accent-red-light text-accent-red",
          )}>
            {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="mt-1 text-sm text-text-secondary">{label}</p>
        {subtitle && <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
