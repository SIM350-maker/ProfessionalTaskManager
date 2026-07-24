'use client';

import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { cn } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ExportFormat = 'csv' | 'pdf';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  loading?: boolean;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ExportButton({ onExport, loading, filename = 'export', className, children }: ExportButtonProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    try {
      await onExport(format);
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
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
