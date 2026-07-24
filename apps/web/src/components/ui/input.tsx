"use client";

import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/helpers";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  maxLength?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, prefix, suffix, clearable, onClear, maxLength, value, onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [charCount, setCharCount] = useState(0);
    const hasValue = value !== undefined && value !== "" && value !== null;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="ml-1 text-accent-red">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{prefix}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            className={cn(
              "block w-full rounded-lg border px-3 py-2 text-sm text-text-primary transition-all duration-[var(--duration-fast)] placeholder:text-text-tertiary bg-bg-card focus:border-border-active focus:outline-none focus:ring-2 focus:ring-accent-blue/20",
              error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
              !error && "border-border-default hover:border-border-hover",
              prefix && "pl-10",
              (suffix || clearable) && "pr-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {suffix && !clearable && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">{suffix}</div>
          )}
          {clearable && hasValue && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-tertiary hover:text-text-secondary focus:outline-none"
              aria-label="Clear input"
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {(error || helperText || maxLength) && (
          <div className="flex justify-between">
            <div>
              {error && (
                <p id={`${inputId}-error`} className="text-sm text-accent-red" role="alert">
                  {error}
                </p>
              )}
              {helperText && !error && (
                <p id={`${inputId}-helper`} className="text-sm text-text-tertiary">
                  {helperText}
                </p>
              )}
            </div>
            {maxLength && (
              <p className="text-xs text-text-tertiary">
                {charCount}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";