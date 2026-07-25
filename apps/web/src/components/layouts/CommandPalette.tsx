'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { NAVIGATION_ITEMS } from '@/lib/constants';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  role: string;
}

const TASK_LABELS: Record<string, string> = {
  ADMINISTRATOR: 'All Tasks',
  MANAGER: 'Team Tasks',
  TEAM_MEMBER: 'My Tasks',
};

export function CommandPalette({ open, onClose, role }: CommandPaletteProps) {
  const roleItems = NAVIGATION_ITEMS
    .filter((item) => (item.roles as readonly string[]).includes(role as never))
    .map((item) => ({
      label: item.label === 'Tasks' ? (TASK_LABELS[role] ?? 'Tasks') : item.label,
      href: item.href as string,
      keywords: item.label.toLowerCase(),
    }));
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? roleItems.filter((item) => item.keywords.includes(query.toLowerCase()))
    : roleItems;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      router.push(filtered[selectedIndex].href as Parameters<typeof router.push>[0]);
      onClose();
    }
  };

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-bg-overlay animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-xl bg-bg-card shadow-modal overflow-hidden">
        <div className="flex items-center border-b border-border-default px-4">
          <Search className="h-5 w-5 shrink-0 text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search pages..."
            className="flex-1 bg-transparent px-3 py-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border-default bg-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
            ESC
          </kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-text-tertiary">No results found</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.href}
                onClick={() => { router.push(item.href as Parameters<typeof router.push>[0]); onClose(); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors',
                  i === selectedIndex
                    ? 'bg-bg-active text-accent-blue'
                    : 'text-text-primary hover:bg-bg-hover',
                )}
              >
                <span className="font-medium">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
