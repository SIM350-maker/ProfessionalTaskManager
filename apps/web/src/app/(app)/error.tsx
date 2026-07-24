'use client';

import { Button } from '@/components/ui/button';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-bg-subtle">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-secondary">{error.message || 'An unexpected error occurred'}</p>
        <Button variant="primary" className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
