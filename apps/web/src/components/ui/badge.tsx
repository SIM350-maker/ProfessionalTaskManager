import type { HTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/helpers";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info" | "outline";
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  counter?: number;
}

const variantStyles = {
  default: "bg-bg-hover text-text-secondary",
  primary: "bg-accent-blue-light text-accent-blue",
  success: "bg-accent-green-light text-accent-green",
  warning: "bg-accent-amber-light text-accent-amber",
  error: "bg-accent-red-light text-accent-red",
  info: "bg-accent-blue-light text-accent-blue",
  outline: "border border-border-default text-text-secondary",
};

export function Badge({ className, variant = "default", dot, removable, onRemove, counter, children, ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors", variantStyles[variant], className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot && variant === "success" ? "bg-accent-green" : variant === "warning" ? "bg-accent-amber" : variant === "error" ? "bg-accent-red" : variant === "primary" ? "bg-accent-blue" : "bg-text-tertiary")} />}
      {counter !== undefined && (
        <span className={cn("-ml-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold", variant === "default" ? "bg-accent-blue text-white" : "bg-current/20")}>
          {counter > 99 ? "99+" : counter}
        </span>
      )}
      {children}
      {removable && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none" aria-label="Remove">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

const statusColors: Record<string, string> = {
  TODO: "bg-bg-hover text-text-secondary",
  IN_PROGRESS: "bg-accent-blue-light text-accent-blue",
  IN_REVIEW: "bg-accent-amber-light text-accent-amber",
  DONE: "bg-accent-green-light text-accent-green",
  ARCHIVED: "bg-bg-hover text-text-tertiary",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status, dot }: { status: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", statusColors[status] ?? statusColors.TODO)}>
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", status === "DONE" ? "bg-accent-green" : status === "IN_PROGRESS" ? "bg-accent-blue" : status === "IN_REVIEW" ? "bg-accent-amber" : "bg-text-tertiary")} />
      )}
      {statusLabels[status] ?? status}
    </span>
  );
}

const priorityColors: Record<string, string> = {
  LOW: "bg-bg-hover text-text-secondary",
  MEDIUM: "bg-accent-blue-light text-accent-blue",
  HIGH: "bg-accent-amber-light text-accent-amber",
  URGENT: "bg-accent-red-light text-accent-red",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", priorityColors[priority] ?? priorityColors.MEDIUM)}>
      {priorityLabels[priority] ?? priority}
    </span>
  );
}