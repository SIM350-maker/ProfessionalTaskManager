"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/helpers";

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  name?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, defaultValue, onValueChange, onChange, name, options, placeholder = "Select...", label, error, className, disabled }: SelectProps) {
  const handleChange = onValueChange ?? onChange ?? (() => {});
  const currentValue = value ?? defaultValue ?? '';
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">{label}</label>
      )}
      <SelectPrimitive.Root value={currentValue} onValueChange={handleChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm bg-bg-card transition-all duration-[var(--duration-fast)]",
            error ? "border-accent-red" : "border-border-default hover:border-border-hover",
            "focus:border-border-active focus:outline-none focus:ring-2 focus:ring-accent-blue/20",
            "data-[placeholder]:text-text-tertiary",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border-default bg-bg-card shadow-dropdown animate-in fade-in-0 zoom-in-95">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-colors",
                    "data-[highlighted]:bg-bg-hover data-[state=checked]:bg-accent-blue-light data-[state=checked]:text-accent-blue",
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-sm text-accent-red">{error}</p>}
    </div>
  );
}