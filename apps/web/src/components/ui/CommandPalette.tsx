'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

const NAV_ITEMS: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: '✅' },
  { id: 'projects', label: 'Projects', href: '/projects', icon: '📁' },
  { id: 'teams', label: 'Teams', href: '/teams', icon: '👥' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: '📈' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
  { id: 'profile', label: 'Profile', href: '/profile', icon: '👤' },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: '🔔' },
];

interface CommandPaletteProps {
  onNavigate: (href: string) => void;
  className?: string;
}

export function CommandPalette({ onNavigate, className }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- safe: resets query state only when palette opens
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      onNavigate(href);
    },
    [onNavigate],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-border-default bg-bg-card shadow-modal',
          className,
        )}
      >
        <div className="flex items-center border-b border-border-default px-4">
          <Search className="mr-3 h-5 w-5 shrink-0 text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent py-4 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <kbd className="hidden rounded-md border border-border-default px-1.5 py-0.5 text-xs text-text-tertiary sm:inline-block">
            ESC
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-text-secondary">No results found</li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-hover"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
