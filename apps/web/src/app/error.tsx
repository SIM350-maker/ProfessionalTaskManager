'use client';

import { Button } from '@/components/ui/button';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-subtle p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary">500</h1>
        <h2 className="mt-2 text-xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-secondary">{error.message || 'An unexpected error occurred'}</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
