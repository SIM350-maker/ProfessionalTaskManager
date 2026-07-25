'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { getActionErrorMessage } from '@/lib/helpers';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { registerUser } = await import('@/actions');
    const result = await registerUser(formData);

    if (result.success) {
      router.push('/auth/login');
      return;
    }
    setError(getActionErrorMessage(result.error));
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <PageTransition className="w-full max-w-5xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="text-sm text-text-secondary">Start managing your team&apos;s work</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red"
                >
                  {error}
                </motion.div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" required prefix={<User className="h-4 w-4" />} />
                <Input label="Last Name" name="lastName" required prefix={<User className="h-4 w-4" />} />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                prefix={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                helperText="At least 8 characters with a letter and number"
                prefix={<Lock className="h-4 w-4" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pointer-events-auto text-text-tertiary hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <Input label="Organization" name="organizationName" required placeholder="Your Company Inc." prefix={<User className="h-4 w-4" />} />
              <Button type="submit" loading={loading} className="w-full">
                Create account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-text-link hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}
