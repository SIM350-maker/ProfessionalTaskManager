'use client';

import { Button } from '@/components/ui/button';

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle p-4">
      <div className="w-full max-w-5xl rounded-lg border border-border-default bg-bg-card p-8 text-center shadow-card">
        <h2 className="text-xl font-semibold text-text-primary">Authentication Error</h2>
        <p className="mt-2 text-sm text-text-secondary">{error.message || 'Something went wrong during authentication'}</p>
        <Button variant="primary" className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
