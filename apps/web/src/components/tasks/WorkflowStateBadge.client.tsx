'use client';

import { useMemo } from 'react';
import type { WorkflowState } from '@/types';
import { cn } from '@/lib/helpers';

interface WorkflowStateBadgeProps {
  state: WorkflowState;
  transitions?: Array<{ id: string; toState: { id: string; name: string; color: string } }>;
  onTransition?: (toStateId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function WorkflowStateBadge({ state, transitions = [], onTransition, size = 'md' }: WorkflowStateBadgeProps) {
  const canTransition = useMemo(() => {
    return transitions.length > 0;
  }, [transitions]);

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5';

  const badge = (
    <span
      className={cn('inline-flex items-center rounded-full font-medium transition-colors', sizeClasses)}
      style={{ backgroundColor: `${state.color}20`, color: state.color }}
    >
      {state.name}
    </span>
  );

  if (!canTransition || !onTransition) {
    return badge;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badge}
      {transitions.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {transitions.slice(0, 3).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTransition(t.toState.id)}
              className="rounded-full border border-border-default px-2 py-0.5 text-xs text-text-secondary transition-colors hover:border-accent-blue hover:text-accent-blue"
              title={`Move to ${t.toState.name}`}
            >
              → {t.toState.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
