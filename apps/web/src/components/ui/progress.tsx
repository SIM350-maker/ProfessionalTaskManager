"use client";

import { cn } from "@/lib/helpers";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

const variantStyles = {
  default: "bg-accent-blue",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  error: "bg-accent-red",
};

export function ProgressBar({ value, max = 100, size = "md", variant = "default", showLabel, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex-1 overflow-hidden rounded-full bg-bg-inset", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out animate-progress-fill", variantStyles[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-text-secondary">{Math.round(pct)}%</span>}
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const ringVariants = {
  default: "stroke-accent-blue",
  success: "stroke-accent-green",
  warning: "stroke-accent-amber",
  error: "stroke-accent-red",
};

export function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, variant = "default", showLabel, label, className }: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-bg-inset)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("transition-all duration-1000 ease-out", ringVariants[variant])}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {(showLabel || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showLabel && <span className="text-lg font-bold text-text-primary">{Math.round(pct)}%</span>}
          {label && <span className="text-[10px] text-text-tertiary">{label}</span>}
        </div>
      )}
    </div>
  );
}