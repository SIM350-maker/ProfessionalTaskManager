'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Workflow, WorkflowState } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export interface WorkflowFormData {
  id?: string;
  name: string;
  entityType: string;
  isDefault?: boolean;
  states: Array<{
    id?: string;
    name: string;
    color: string;
    isInitial?: boolean;
    isFinal?: boolean;
    orderIndex: number;
  }>;
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/v1/csrf');
  const data = await res.json();
  return data.token;
}

export function useWorkflows(organizationId: string | undefined, entityType = 'TASK') {
  const [workflows, setWorkflows] = useState<(Workflow & { states: WorkflowState[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/v1/workflows?entityType=${entityType}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [organizationId, entityType]);

  return {
    workflows,
    loading,
    error,
    refetch: () => {
      if (!organizationId) return;
      setLoading(true);
      fetch(`/api/v1/workflows?entityType=${entityType}`)
        .then((res) => res.json())
        .then((data) => {
          setWorkflows(data.data ?? []);
          setError(null);
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
        .finally(() => setLoading(false));
    },
  };
}

export function useCreateWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = useCallback(async (data: WorkflowFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create workflow');
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

export function useUpdateWorkflow(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const update = useCallback(async (data: Partial<WorkflowFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch(`/api/v1/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update workflow');
      }
      router.refresh();
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  return { update, loading, error };
}

export function useDeleteWorkflow(id: string) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const remove = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getCsrfToken();
      const res = await fetch(`/api/v1/workflows/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': token,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to delete workflow');
      }
      router.refresh();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  return { remove, loading };
}

interface WorkflowFormProps {
  workflow?: Workflow & { states: WorkflowState[] };
  onSuccess?: () => void;
  onClose?: () => void;
}

const DEFAULT_COLORS: readonly string[] = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function WorkflowForm({ workflow, onSuccess, onClose }: WorkflowFormProps) {
  const create = useCreateWorkflow();
  const update = useUpdateWorkflow(workflow?.id ?? '');
  const [name, setName] = useState(workflow?.name ?? '');
  const [isDefault, setIsDefault] = useState(workflow?.isDefault ?? false);
  const [states, setStates] = useState<WorkflowFormData['states']>(
    (workflow?.states?.map((s): WorkflowFormData['states'][number] => ({
      id: s.id,
      name: s.name,
      color: (s.color || DEFAULT_COLORS[0]) as string,
      isInitial: s.isInitial,
      isFinal: s.isFinal,
      orderIndex: s.orderIndex,
    })) ?? [
      { name: '', color: '#3b82f6', isInitial: true, isFinal: false, orderIndex: 0 },
    ]) as WorkflowFormData['states']
  );
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!workflow?.id;

  const updateState = useCallback((index: number, patch: Partial<WorkflowFormData['states'][number]>) => {
    setStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }, []);

  const removeState = useCallback((index: number) => {
    setStates((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addState = useCallback(() => {
    setStates((prev) => [
      ...prev,
      {
        name: '',
        color: (DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length] ?? '#6b7280') as string,
        isInitial: false,
        isFinal: false,
        orderIndex: prev.length,
      },
    ]);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: WorkflowFormData = {
      id: workflow?.id,
      name,
      entityType: workflow?.entityType ?? 'TASK',
      isDefault,
      states,
    };

    try {
      if (isEditing) {
        await update.update(payload);
      } else {
        await create.create(payload);
      }
      onSuccess?.();
      onClose?.();
    } catch {
      // error already set in hook
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
        label="Workflow Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        helperText="A descriptive name for this workflow"
      />
      <div className="flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-border-default text-accent-blue"
        />
        <label htmlFor="isDefault" className="text-sm text-text-primary">
          Default workflow
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">States</label>
        <div className="space-y-2">
          {states.map((state, index) => (
            <Card key={state.id ?? index} padding="sm">
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="State name"
                      value={state.name}
                      onChange={(e) => updateState(index, { name: e.target.value })}
                      required
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={state.color}
                      onChange={(e) => updateState(index, { color: e.target.value })}
                      className="h-9 w-12 rounded-lg border border-border-default cursor-pointer"
                      title="State color"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={state.isInitial}
                        onChange={(e) => updateState(index, { isInitial: e.target.checked })}
                        className="rounded border-border-default"
                      />
                      Initial
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={state.isFinal}
                        onChange={(e) => updateState(index, { isFinal: e.target.checked })}
                        className="rounded border-border-default"
                      />
                      Final
                    </label>
                    <span className="text-xs text-text-tertiary">Order: {index + 1}</span>
                  </div>
                  {states.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeState(index)}>
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addState} className="mt-2">
          Add State
        </Button>
      </div>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isEditing ? update.loading : create.loading}>
            {isEditing ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </CardFooter>
    </form>
  );
}
