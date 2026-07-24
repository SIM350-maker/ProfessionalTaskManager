'use client';

import { useMemo } from 'react';
import type { CustomFieldDefinition } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface CustomFieldsRendererProps {
  fields: CustomFieldDefinition[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
}

interface FieldBag {
  stringValue: string;
  numberValue: number | undefined;
  dateValue: string;
  selectValue: string;
}

export function CustomFieldsRenderer({ fields, values, onChange, errors }: CustomFieldsRendererProps) {
  const handleChange = useMemo(() => {
    return (key: string, value: unknown) => {
      onChange({ ...values, [key]: value });
    };
  }, [values, onChange]);

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-secondary">Custom Fields</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const rawValue = values[field.key];
          const error = errors?.[field.key];

          if (field.type === 'MULTI_SELECT') {
            const selected = Array.isArray(rawValue) ? rawValue : [];
            const options = Array.isArray(field.options) ? field.options : [];
            return (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  {field.name}
                  {field.isRequired && <span className="ml-1 text-accent-red">*</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => {
                    const isSelected = selected.includes(opt as string);
                    return (
                      <button
                        key={String(opt)}
                        type="button"
                        onClick={() => {
                          const next = isSelected ? selected.filter((v: string) => v !== opt) : [...selected, opt];
                          handleChange(field.key, next);
                        }}
                        className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                          isSelected
                            ? 'border-accent-blue bg-accent-blue-light text-accent-blue'
                            : 'border-border-default text-text-secondary hover:border-accent-blue'
                        }`}
                      >
                        {String(opt)}
                      </button>
                    );
                  })}
                </div>
                {error && (
                  <p className="text-xs text-accent-red" role="alert">{error}</p>
                )}
              </div>
            );
          }

          const stringValue = typeof rawValue === 'string' ? rawValue : '';
          const numberValue = typeof rawValue === 'number' ? rawValue : undefined;
          const dateValue = typeof rawValue === 'string' ? rawValue : '';
          const selectValue = typeof rawValue === 'string' ? rawValue : '';

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                {field.name}
                {field.isRequired && <span className="ml-1 text-accent-red">*</span>}
              </label>

              {renderFieldControl(field, rawValue, { stringValue, numberValue, dateValue, selectValue }, (value) => handleChange(field.key, value))}

              {error && (
                <p className="text-xs text-accent-red" role="alert">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderFieldControl(field: CustomFieldDefinition, rawValue: unknown, bag: FieldBag, onChange: (value: unknown) => void) {
  switch (field.type) {
    case 'TEXT':
      return (
        <Input
          value={bag.stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.name.toLowerCase()}`}
        />
      );

    case 'NUMBER':
      return (
        <Input
          type="number"
          value={bag.numberValue !== undefined ? String(bag.numberValue) : ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          placeholder={`Enter ${field.name.toLowerCase()}`}
        />
      );

    case 'DATE':
      return (
        <Input
          type="date"
          value={bag.dateValue}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case 'SELECT': {
      const options = Array.isArray(field.options)
        ? [{ value: '', label: 'Select...' }, ...field.options.map((opt) => ({ value: String(opt), label: String(opt) }))]
        : [];
      return (
        <Select
          value={bag.selectValue}
          onChange={(val) => onChange(val ?? null)}
          options={options}
        />
      );
    }

    case 'BOOLEAN':
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(rawValue)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-border-default text-accent-blue"
          />
          <span className="text-sm text-text-secondary">Yes</span>
        </label>
      );

    case 'USER':
      return (
        <Select
          value={bag.selectValue}
          onChange={(val) => onChange(val ?? null)}
          options={[{ value: '', label: 'Select...' }]}
          disabled
        />
      );

    default:
      return null;
  }
}
