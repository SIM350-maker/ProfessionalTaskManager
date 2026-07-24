import type { ReactNode } from "react";
import { cn } from "@/lib/helpers";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-tertiary text-center max-w-sm">{description}</p>}
      {action && (
        <Button variant="primary" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
