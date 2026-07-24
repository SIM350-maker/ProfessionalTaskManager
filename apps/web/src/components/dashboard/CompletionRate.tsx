"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { cn } from "@/lib/helpers";

interface CompletionRateProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

export function CompletionRate({ completed, total, label = "Completion Rate", className }: CompletionRateProps) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const variant = rate >= 80 ? "success" : rate >= 50 ? "default" : rate >= 25 ? "warning" : "error";

  return (
    <Card className={cn("flex items-center gap-6 p-5", className)}>
      <ProgressRing value={rate} size={80} strokeWidth={7} variant={variant} showLabel />
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="mt-1 text-2xl font-bold text-text-primary">{completed}</p>
        <p className="text-xs text-text-tertiary">of {total} tasks completed</p>
      </div>
    </Card>
  );
}
