'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomFieldDefinition, CustomFieldType } from '@/types';
import { CUSTOM_FIELD_TYPE_VALUES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card, CardFooter } from '@/components/ui/card';

export interface CustomFieldFormData {
  id?: string;
  name: string;
  key: string;
  type: CustomFieldType;
  options?: string[];
  isRequired?: boolean;
  entityType?: string;
  projectId?: string;
}

async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/v1/csrf');
  const data = await res.json();
  return data.token;
}

export function useCustomFields(organizationId: string | undefined, entityType = 'TASK', projectId?: string) {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    const params = new URLSearchParams({ entityType });
    if (projectId) params.set('projectId', projectId);
    fetch(`/api/v1/custom-fields?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setFields(data.data ?? []);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [organizationId, entityType, projectId]);

  return { fields, loading, error };
}

export function useCreateCustomField() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const create = useCallback(async (data: CustomFieldFormData) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch('/api/v1/custom-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create custom field');
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

export function useUpdateCustomField(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const update = useCallback(async (data: Partial<CustomFieldFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCsrfToken();
      const res = await fetch(`/api/v1/custom-fields/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update custom field');
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

export function useDeleteCustomField(id: string) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const remove = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getCsrfToken();
      const res = await fetch(`/api/v1/custom-fields/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': token,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to delete custom field');
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

interface CustomFieldFormProps {
  field?: CustomFieldDefinition;
  onSuccess?: () => void;
  onClose?: () => void;
}

const TYPES_WITH_OPTIONS: CustomFieldType[] = ['SELECT', 'MULTI_SELECT'];

export function CustomFieldForm({ field, onSuccess, onClose }: CustomFieldFormProps) {
  const create = useCreateCustomField();
  const update = useUpdateCustomField(field?.id ?? '');
  const [name, setName] = useState(field?.name ?? '');
  const [key, setKey] = useState(field?.key ?? '');
  const [type, setType] = useState<CustomFieldType>(field?.type ?? 'TEXT');
  const [options, setOptions] = useState<string[]>(
    (Array.isArray(field?.options) ? field.options.map((o) => String(o)) : [])
  );
  const [isRequired, setIsRequired] = useState(field?.isRequired ?? false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!field?.id;

  const updateOption = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, '']);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: CustomFieldFormData = {
      id: field?.id,
      name,
      key,
      type,
      options: TYPES_WITH_OPTIONS.includes(type) ? options : undefined,
      isRequired,
      entityType: field?.entityType ?? 'TASK',
      projectId: field?.projectId ?? undefined,
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
        label="Field Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        helperText="Human-readable name for this field"
      />
      <Input
        label="Field Key"
        value={key}
        onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
        required
        helperText="Lowercase alphanumeric with underscores"
      />
      <Select
        label="Field Type"
        value={type}
        onChange={(val) => setType(val as CustomFieldType)}
        options={CUSTOM_FIELD_TYPE_VALUES.map((t) => ({ value: t, label: t }))}
      />
      <div className="flex items-center gap-2">
        <input
          id="isRequired"
          type="checkbox"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          className="h-4 w-4 rounded border-border-default text-accent-blue"
        />
        <label htmlFor="isRequired" className="text-sm text-text-primary">
          Required
        </label>
      </div>
      {TYPES_WITH_OPTIONS.includes(type) && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Options</label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {options.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
            Add Option
          </Button>
        </div>
      )}
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isEditing ? update.loading : create.loading}>
            {isEditing ? 'Update Field' : 'Create Field'}
          </Button>
        </div>
      </CardFooter>
    </form>
  );
}
