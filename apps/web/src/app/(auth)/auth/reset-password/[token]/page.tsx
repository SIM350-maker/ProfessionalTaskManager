'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ResetPasswordTokenPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { resetPassword } = await import('@/actions');
    const result = await resetPassword(params.token, formData);

    if (result.success) {
      router.push('/auth/login');
      return;
    }
    setError(result.error?.message ?? 'Failed to reset password');
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">Set new password</h1>
          <p className="text-sm text-text-secondary">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>
            )}
            <Input
              label="New Password"
              name="password"
              type="password"
              required
              helperText="At least 8 characters with a letter and number"
            />
            <Button type="submit" loading={loading} className="w-full">
              Reset Password
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
