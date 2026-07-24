import Link from 'next/link';
import { type ComponentProps } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 rounded p-1 text-text-tertiary hover:text-text-secondary transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.length > 0 && <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (isLast || !item.href) {
          return (
            <span
              key={item.label}
              className={cn(
                'truncate max-w-[200px]',
                isLast
                  ? 'text-text-primary font-medium'
                  : 'text-text-tertiary',
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          );
        }
        return (
          <>
            <Link
              key={item.label}
              href={item.href as ComponentProps<typeof Link>['href']}
              className="truncate max-w-[160px] rounded px-1 py-0.5 text-text-tertiary hover:text-text-secondary hover:bg-bg-hover transition-colors"
            >
              {item.label}
            </Link>
            <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
          </>
        );
      })}
    </nav>
  );
}