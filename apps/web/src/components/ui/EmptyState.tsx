import type { ReactNode } from 'react';
import { cn } from '@/lib/helpers';

import Link from 'next/link';
import type { Route } from 'next';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode | { label: string; href: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && (
        <div className="mt-6">
          {isActionObject(action) ? (
            action.href ? (
              <Link href={action.href as Route} className="inline-flex items-center rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-text-inverse hover:bg-accent-blue-hover">
                {action.label}
              </Link>
            ) : (
              <button onClick={action.onClick} className="inline-flex items-center rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-text-inverse hover:bg-accent-blue-hover">
                {action.label}
              </button>
            )
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

function isActionObject(action: unknown): action is { label: string; href?: string; onClick?: () => void } {
  return typeof action === 'object' && action !== null && 'label' in action;
}
