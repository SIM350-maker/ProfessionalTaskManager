'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface CursorPaginationProps {
  total: number;
  limit: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onLoadMore: () => void;
  onPrev?: () => void;
}

export function CursorPagination({ total, limit, hasNextPage, hasPrevPage, onLoadMore, onPrev }: CursorPaginationProps) {
  const showing = hasPrevPage ? `${limit} more` : `first ${Math.min(limit, total)}`;

  return (
    <div className="flex items-center justify-between px-6 py-3">
      <p className="text-sm text-text-secondary">
        Showing {showing} of {total}
      </p>
      <div className="flex gap-2">
        {hasPrevPage && onPrev && (
          <button
            onClick={onPrev}
            className="rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
          >
            Previous
          </button>
        )}
        {hasNextPage && (
          <button
            onClick={onLoadMore}
            className="rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

interface PagePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageSize?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
}

export function PagePagination({ page, totalPages, onPageChange, showPageSize, pageSize = 20, onPageSizeChange, totalItems }: PagePaginationProps) {
  const [gotoInput, setGotoInput] = useState('');

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }

  function handleGoto(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(gotoInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setGotoInput('');
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
      <p className="text-sm text-text-secondary">
        {totalItems
          ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} of ${totalItems}`
          : `Page ${page} of ${totalPages}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="rounded-lg border border-border-default px-2 py-1.5 text-sm text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-border-default px-2 py-1.5 text-sm text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-2 text-sm text-text-tertiary">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                p === page
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:bg-bg-hover',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-border-default px-2 py-1.5 text-sm text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="rounded-lg border border-border-default px-2 py-1.5 text-sm text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>

        <form onSubmit={handleGoto} className="ml-2 flex items-center gap-1">
          <span className="text-sm text-text-tertiary">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={gotoInput}
            onChange={(e) => setGotoInput(e.target.value)}
            className="w-14 rounded-md border border-border-default px-2 py-1 text-sm text-center text-text-primary bg-bg-card focus:outline-none focus:ring-1 focus:ring-accent-blue"
            placeholder="#"
          />
        </form>
      </div>

      {showPageSize && onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-border-default px-2 py-1 text-sm text-text-primary bg-bg-card focus:outline-none focus:ring-1 focus:ring-accent-blue"
        >
          {[10, 20, 50, 100].map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      )}
    </div>
  );
}