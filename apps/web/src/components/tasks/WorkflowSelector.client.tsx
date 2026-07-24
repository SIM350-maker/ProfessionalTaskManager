'use client';

import { useMemo } from 'react';
import type { Workflow, WorkflowState } from '@/types';

interface WorkflowSelectorProps {
  workflows: (Workflow & { states: WorkflowState[] })[];
  selectedWorkflowId?: string;
  onChange: (workflowId: string) => void;
  disabled?: boolean;
}

export function WorkflowSelector({ workflows, selectedWorkflowId, onChange, disabled }: WorkflowSelectorProps) {
  const defaultWorkflow = useMemo(() => workflows.find((w) => w.isDefault), [workflows]);

  if (workflows.length === 0) {
    return null;
  }

  const selectedId = selectedWorkflowId ?? defaultWorkflow?.id ?? '';
  const stateCount = workflows.find((w) => w.id === selectedId)?.states?.length ?? 0;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-primary">Workflow</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20 disabled:opacity-60"
      >
        {workflows.map((wf) => (
          <option key={wf.id} value={wf.id}>
            {wf.name} {wf.isDefault ? '(Default)' : ''}
          </option>
        ))}
      </select>
      <p className="text-xs text-text-tertiary">
        {stateCount} available states
      </p>
    </div>
  );
}
