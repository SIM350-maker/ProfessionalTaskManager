'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { requestPasswordReset } = await import('@/actions');
    const result = await requestPasswordReset(formData);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error?.message ?? 'Failed to send reset email');
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
        <Card className="w-full max-w-5xl">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
            <p className="mt-2 text-sm text-text-secondary">
              If an account exists with that email, we&apos;ve sent password reset instructions.
            </p>
            <Link href="/auth/login" className="mt-4 inline-block text-sm text-text-link hover:underline">
              Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          <p className="text-sm text-text-secondary">Enter your email and we&apos;ll send you a reset link</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>
            )}
            <Input label="Email" name="email" type="email" required placeholder="you@example.com" />
            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-text-secondary">
            <Link href="/auth/login" className="font-medium text-text-link hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
