'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask } from '@/actions';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TASK_STATUS_VALUES, PRIORITY_VALUES } from '@/types';

interface FieldErrors {
  title?: string[];
  description?: string[];
  projectId?: string[];
  status?: string[];
  priority?: string[];
  dueDate?: string[];
  estimatedHours?: string[];
  assigneeIds?: string[];
}

interface FormState {
  success: boolean;
  error?: { message?: string; _errors?: FieldErrors };
  data?: unknown;
}

interface TaskFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function TaskForm({ projectId, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev: FormState, formData: FormData) => {
      formData.set('projectId', projectId);
      const result = await createTask(formData) as FormState;
      if (result.success) {
        onSuccess?.();
        router.refresh();
        return result;
      }
      if (result.error && '_errors' in result.error) {
        setFieldErrors(result.error._errors ?? {});
      }
      return result;
    },
    { success: false },
  );

  const errorMessage = state.error && 'message' in state.error ? state.error.message : null;

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={fieldErrors.title?.[0]}
        required
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-secondary">
          Description
        </label>
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-border-default px-3 py-2 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
        {fieldErrors.description?.[0] && (
          <p className="text-sm text-accent-red" role="alert">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(val) => setStatus(val as string)}
          error={fieldErrors.status?.[0]}
          options={TASK_STATUS_VALUES.map((s) => ({
            value: s,
            label: s.replace(/_/g, ' '),
          }))}
        />
        <Select
          label="Priority"
          name="priority"
          value={priority}
          onChange={(val) => setPriority(val as string)}
          error={fieldErrors.priority?.[0]}
          options={PRIORITY_VALUES.map((p) => ({
            value: p,
            label: p,
          }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="date"
          name="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={fieldErrors.dueDate?.[0]}
        />
        <Input
          label="Estimated Hours"
          type="number"
          name="estimatedHours"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
          error={fieldErrors.estimatedHours?.[0]}
          min="0"
          step="0.5"
        />
      </div>
      {errorMessage && (
        <div className="rounded-md bg-accent-red-light p-3 text-sm text-accent-red" role="alert">
          {errorMessage}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button type="submit" loading={pending}>
          Create Task
        </Button>
      </div>
    </form>
  );
}
