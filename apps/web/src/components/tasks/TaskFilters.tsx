'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/helpers';
import type { TaskStatus, Priority } from '@/types';

interface TaskFiltersProps {
  projects: { id: string; name: string }[];
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-40 items-center justify-between rounded-lg border border-border-default bg-bg-card px-3 py-2 text-left text-sm transition-colors hover:border-border-hover',
          selected.length > 0 ? 'text-text-primary' : 'text-text-secondary',
        )}
      >
        <span className="truncate">
          {selected.length === 0 ? label : `${selected.length} selected`}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-text-tertiary" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-lg border border-border-default bg-bg-card py-1 shadow-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-hover"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                readOnly
                className="h-4 w-4 rounded border-border-default text-accent-blue"
              />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskFilters({ projects }: TaskFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [statuses, setStatuses] = useState<string[]>(() => searchParams.get('status')?.split(',').filter(Boolean) ?? []);
  const [priorities, setPriorities] = useState<string[]>(() => searchParams.get('priority')?.split(',').filter(Boolean) ?? []);
  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') ?? 'desc');

  const debouncedSearch = useDebounce(search, 300);

  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushURL = useCallback(() => {
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statuses.length > 0) params.set('status', statuses.join(','));
      if (priorities.length > 0) params.set('priority', priorities.join(','));
      if (projectId) params.set('projectId', projectId);
      if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
      if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}` as any);
      pendingRef.current = null;
    }, 0);
  }, [debouncedSearch, statuses, priorities, projectId, sortBy, sortOrder, router, pathname]);

  useEffect(() => {
    flushURL();
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, [flushURL]);

  function handleSortByChange(value: string) {
    setSortBy(value);
  }

  function handleToggleOrder() {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  function handleReset() {
    setSearch('');
    setStatuses([]);
    setPriorities([]);
    setProjectId('');
    setSortBy('createdAt');
    setSortOrder('desc');
  }

  const hasFilters = search || statuses.length > 0 || priorities.length > 0 || projectId || sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-default bg-bg-card p-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-border-default bg-bg-card py-2 pl-10 pr-3 text-sm text-text-primary transition-colors placeholder:text-text-tertiary hover:border-border-hover focus:border-border-active focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
        />
      </div>

      <MultiSelect label="Status" options={STATUS_OPTIONS} selected={statuses} onChange={setStatuses} />
      <MultiSelect label="Priority" options={PRIORITY_OPTIONS} selected={priorities} onChange={setPriorities} />

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="w-40 rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary transition-colors hover:border-border-hover focus:border-border-active focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
        className="w-36 rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary transition-colors hover:border-border-hover focus:border-border-active focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleToggleOrder}
        className="rounded-lg border border-border-default bg-bg-card p-2 text-text-secondary transition-colors hover:bg-bg-hover"
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-accent-red/30 bg-bg-card px-3 py-2 text-sm text-accent-red transition-colors hover:bg-accent-red-light"
        >
          Reset
        </button>
      )}
    </div>
  );
}