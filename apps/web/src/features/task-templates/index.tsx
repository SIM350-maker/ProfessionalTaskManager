'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import type { TaskTemplate, TaskStatus, Priority } from '@/types';

export interface TaskTemplateFormData {
  id?: string;
  name: string;
  description?: string;
  defaultStatus?: TaskStatus;
  defaultPriority?: Priority;
  estimatedHours?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  fields?: Record<string, unknown>;
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/v1/csrf');
  const data = await res.json();
  return data.token;
}

export function useTaskTemplates(organizationId: string | undefined) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    fetch('/api/v1/task-templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return { templates, loading, error, refetch: () => setLoading(true) };
}

export function useCreateTaskTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = useCallback(async (data: TaskTemplateFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch('/api/v1/task-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create template');
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

interface TaskTemplateFormProps {
  template?: TaskTemplate;
  onSuccess?: () => void;
  onClose?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function TaskTemplateForm({ template, onSuccess, onClose }: TaskTemplateFormProps) {
  const create = useCreateTaskTemplate();
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>(template?.defaultStatus ?? 'TODO');
  const [defaultPriority, setDefaultPriority] = useState<Priority>(template?.defaultPriority ?? 'MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState(template?.estimatedHours?.toString() ?? '');
  const [isRecurring, setIsRecurring] = useState(template?.isRecurring ?? false);
  const [recurrenceRule, setRecurrenceRule] = useState(template?.recurrenceRule ?? '');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!template?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await create.create({
        id: template?.id,
        name,
        description,
        defaultStatus,
        defaultPriority,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        isRecurring,
        recurrenceRule: recurrenceRule || undefined,
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
        label="Template Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        helperText="e.g., Weekly Report, Bug Fix, Deployment"
      />
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          placeholder="Describe when to use this template..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Default Status</label>
          <select
            value={defaultStatus}
            onChange={(e) => setDefaultStatus(e.target.value as TaskStatus)}
            className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Default Priority</label>
          <select
            value={defaultPriority}
            onChange={(e) => setDefaultPriority(e.target.value as Priority)}
            className="w-full rounded-lg border border-border-default bg-bg-default px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Input
        label="Estimated Hours"
        type="number"
        step="0.5"
        min="0"
        value={estimatedHours}
        onChange={(e) => setEstimatedHours(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <input
          id="isRecurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-border-default text-accent-blue"
        />
        <label htmlFor="isRecurring" className="text-sm text-text-primary">
          Recurring task
        </label>
      </div>
      {isRecurring && (
        <Input
          label="Recurrence Rule (iCal RRULE)"
          value={recurrenceRule}
          onChange={(e) => setRecurrenceRule(e.target.value)}
          helperText="e.g., FREQ=WEEKLY;INTERVAL=1 for weekly tasks"
        />
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={isEditing ? create.loading : create.loading}>
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
