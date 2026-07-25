'use client';

import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Enables a leading checkbox column; controlled selection state lives with the caller. */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string;
  emptyMessage?: string;
}

/** Reusable checkbox column for tables that support row selection (e.g. bulk actions). */
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-border-default text-accent-blue"
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-border-default text-accent-blue"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  };
}

/**
 * Shared enterprise data-table primitive (TanStack Table under the hood) — sortable
 * column headers, optional row-selection, consistent styling. Column `cell` renderers
 * can return arbitrary React content, so this doesn't sacrifice rich per-row UI (avatars,
 * badges, inline actions) for the sake of tabular semantics.
 */
export function DataTable<TData>({
  columns,
  data,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  onRowClick,
  getRowClassName,
  emptyMessage = 'No results found.',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(rowSelection !== undefined ? { rowSelection } : {}),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(rowSelection ?? {}) : updater;
          onRowSelectionChange(next);
        }
      : undefined,
    enableRowSelection: !!onRowSelectionChange,
    getRowId: getRowId as ((row: TData) => string) | undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-tertiary">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border-default text-left">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                return (
                  <th key={header.id} className="pb-3 pr-4 font-medium text-text-secondary">
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-text-primary"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortState === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : sortState === 'desc' ? (
                          <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                'border-b border-border-default transition-colors hover:bg-bg-hover',
                onRowClick && 'cursor-pointer',
                getRowClassName?.(row.original),
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-3 pr-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
