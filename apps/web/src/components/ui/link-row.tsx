import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/helpers';

interface LinkRowProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/**
 * Shared style for a clickable list row (dashboard task/project previews, etc.) — a
 * lighter-weight sibling to `Card` for rows nested inside an existing Card/CardContent,
 * where a full elevated card (bg-bg-card + shadow-card) would be too heavy.
 */
export function LinkRow({ href, className, children, ...props }: LinkRowProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center justify-between rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
