'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import type { AutomationRule, AutomationTrigger, AutomationActionType } from '@/types';
import { TRIGGER_LABELS, ACTION_LABELS } from '@/lib/automation-constants';

export interface AutomationRuleFormData {
  id?: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  isActive?: boolean;
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/v1/csrf');
  const data = await res.json();
  return data.token;
}

export function useAutomationRules(organizationId: string | undefined) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    fetch('/api/v1/automation-rules')
      .then((res) => res.json())
      .then((data) => {
        setRules(data.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return { rules, loading, error, refetch: () => setLoading(true) };
}

export function useCreateAutomationRule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = useCallback(async (data: AutomationRuleFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch('/api/v1/automation-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create rule');
      }
      router.refresh();
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { create, loading, error };
}

const TRIGGER_OPTIONS = Object.entries(TRIGGER_LABELS).map(([value, label]) => ({ value, label }));
const ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }));

interface AutomationRuleFormProps {
  rule?: AutomationRule;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function AutomationRuleForm({ rule, onSuccess, onClose }: AutomationRuleFormProps) {
  const create = useCreateAutomationRule();
  const [name, setName] = useState(rule?.name ?? '');
  const [description, setDescription] = useState(rule?.description ?? '');
  const [trigger, setTrigger] = useState<AutomationTrigger>(rule?.trigger ?? 'TASK_CREATED');
  const [conditionsJson, setConditionsJson] = useState(JSON.stringify(rule?.conditions ?? {}, null, 2));
  const [actionsJson, setActionsJson] = useState(JSON.stringify(rule?.actions ?? [], null, 2));
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!rule?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let conditions: Record<string, unknown>;
    let actions: Array<Record<string, unknown>>;

    try {
      conditions = JSON.parse(conditionsJson);
      actions = JSON.parse(actionsJson);
    } catch {
      setError('Invalid JSON format');
      return;
    }

    try {
      await create.create({
        id: rule?.id,
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive,
      });
      onSuccess?.();
      onClose?.();
    } catch {
      // error handled in hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-accent-red-light p-3 text-sm text-accent-red" role="alert">
          {error}
        </div>
      )}
      <Input
        label="Rule Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        helperText="e.g., Auto-assign high priority tasks to team lead"
      />
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Trigger</label>
        <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
          className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        >
          {TRIGGER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Conditions (JSON)</label>
        <textarea
          value={conditionsJson}
          onChange={(e) => setConditionsJson(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary font-mono focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          placeholder='{"priority": "HIGH", "projectId": "..."}'
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Actions (JSON Array)</label>
        <textarea
          value={actionsJson}
          onChange={(e) => setActionsJson(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary font-mono focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          placeholder='[{"type": "ASSIGN_USER", "userId": "..."}]'
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-border-default text-accent-blue"
        />
        <label htmlFor="isActive" className="text-sm text-text-primary">
          Active
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={isEditing ? create.loading : create.loading}>
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}
