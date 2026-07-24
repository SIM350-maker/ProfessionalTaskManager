'use client';

import { useState, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
  resultsCount?: number;
  showResultsCount?: boolean;
  clearable?: boolean;
  shortcut?: string;
}

export function SearchBar({
  onSearch, debounceMs = 300, loading, resultsCount, showResultsCount,
  clearable = true, shortcut, className, placeholder = 'Search...', ...props
}: SearchBarProps) {
  const [value, setValue] = useState(() => (props.defaultValue as string) ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onSearch) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onSearch(value), debounceMs);
    }
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch, debounceMs]);

  function handleClear() {
    setValue('');
    onSearch?.('');
    inputRef.current?.focus();
  }

  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'block w-full rounded-lg border border-border-default bg-bg-card py-2 pl-10 pr-8 text-sm text-text-primary transition-all placeholder:text-text-tertiary hover:border-border-hover focus:border-border-active focus:outline-none focus:ring-2 focus:ring-accent-blue/20',
          hasValue && clearable && 'pr-16',
          className,
        )}
        {...props}
      />
      {hasValue && clearable && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {shortcut && !hasValue && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded-md border border-border-default bg-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary lg:inline-block">
          {shortcut}
        </kbd>
      )}
      {showResultsCount && resultsCount !== undefined && hasValue && (
        <div className="mt-1 text-xs text-text-tertiary">
          {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  );
}