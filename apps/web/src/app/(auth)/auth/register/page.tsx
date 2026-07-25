'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { getActionErrorMessage } from '@/lib/helpers';

type Mode = 'PERSONAL' | 'ORGANIZATION';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<Mode>('PERSONAL');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('mode', mode);
    const { registerUser } = await import('@/actions');
    const result = await registerUser(formData);

    if (result.success) {
      router.push('/dashboard');
      return;
    }
    setError(getActionErrorMessage(result.error));
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-8">
      <PageTransition className="w-full max-w-5xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="text-sm text-text-secondary">Choose how you want to use the platform</p>
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

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('PERSONAL')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    mode === 'PERSONAL' ? 'border-accent-blue bg-accent-blue-light' : 'border-border-default hover:border-accent-blue/50'
                  }`}
                >
                  <UserCheck className={`h-6 w-6 ${mode === 'PERSONAL' ? 'text-accent-blue' : 'text-text-tertiary'}`} />
                  <span className={`text-sm font-medium ${mode === 'PERSONAL' ? 'text-accent-blue' : 'text-text-primary'}`}>Personal</span>
                  <span className="text-xs text-text-secondary">Manage my own tasks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('ORGANIZATION')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    mode === 'ORGANIZATION' ? 'border-accent-blue bg-accent-blue-light' : 'border-border-default hover:border-accent-blue/50'
                  }`}
                >
                  <Briefcase className={`h-6 w-6 ${mode === 'ORGANIZATION' ? 'text-accent-blue' : 'text-text-tertiary'}`} />
                  <span className={`text-sm font-medium ${mode === 'ORGANIZATION' ? 'text-accent-blue' : 'text-text-primary'}`}>Organization / Team</span>
                  <span className="text-xs text-text-secondary">Collaborate with my team</span>
                </button>
              </div>

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
              {mode === 'ORGANIZATION' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <Input
                    label="Organization Name"
                    name="organizationName"
                    required
                    placeholder="Your Company Inc."
                    prefix={<Briefcase className="h-4 w-4" />}
                  />
                </motion.div>
              )}
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
