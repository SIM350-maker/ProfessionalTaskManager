'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('h-9 w-9', className)} />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-bg-subtle text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-[var(--duration-normal)]',
        className,
      )}
      aria-label="Toggle theme"
    >
      <span className={cn('transition-transform duration-500', theme === 'dark' ? 'rotate-180' : 'rotate-0')}>
        {theme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </span>
    </button>
  );
}