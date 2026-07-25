'use client';

import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ExportFormat = 'csv' | 'print';

interface ExportButtonProps {
  /** Must be plain serializable data — this component is a Client Component receiving props from a Server Component. */
  data: Record<string, unknown>[];
  loading?: boolean;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0] ?? {});
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ data, loading, filename = 'export', className, children }: ExportButtonProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  function handleExport(format: ExportFormat) {
    setExporting(format);
    try {
      if (format === 'csv') downloadCsv(data, filename);
      else window.print();
    } finally {
      setExporting(null);
    }
  }

  const isExporting = exporting !== null || loading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)} loading={isExporting}>
          <Download className="h-4 w-4" />
          {children || 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('print')} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
