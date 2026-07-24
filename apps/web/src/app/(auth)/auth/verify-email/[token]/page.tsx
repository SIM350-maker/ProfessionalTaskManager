'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      const { verifyEmail } = await import('@/actions');
      const result = await verifyEmail(params.token);
      if (result.success) {
        setStatus('success');
        setMessage('Email verified successfully');
      } else {
        setStatus('error');
        setMessage(result.error?.message ?? 'Verification failed');
      }
    }
    verify();
  }, [params.token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <Card className="w-full max-w-5xl">
        <CardContent className="pt-6 text-center">
          {status === 'verifying' && (
            <>
              <h1 className="text-2xl font-bold text-text-primary">Verifying your email...</h1>
              <p className="mt-2 text-sm text-text-secondary">Please wait a moment.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-accent-green">Email verified!</h1>
              <p className="mt-2 text-sm text-text-secondary">{message}</p>
              <Link
                href="/auth/login"
                className="mt-4 inline-block text-sm text-text-link hover:underline"
              >
                Sign in to your account
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-accent-red">Verification failed</h1>
              <p className="mt-2 text-sm text-text-secondary">{message}</p>
              <Link
                href="/auth/login"
                className="mt-4 inline-block text-sm text-text-link hover:underline"
              >
                Back to login
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
