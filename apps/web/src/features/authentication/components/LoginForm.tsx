'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { loginUser } from '@/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface FieldErrors {
  email?: string[];
  password?: string[];
}

interface FormState {
  success: boolean;
  error?: { message?: string; _errors?: FieldErrors };
  data?: unknown;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev: FormState, formData: FormData) => {
      const result = await loginUser(formData) as FormState;
      if (result.success) {
        router.push('/dashboard');
        return result;
      }
      if (result.error && '_errors' in result.error) {
        setFieldErrors(result.error._errors ?? {});
      }
      return result;
    },
    { success: false },
  );

  const errorMessage = state.error && 'message' in state.error ? state.error.message : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card padding="lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-text-primary">Sign in</h1>
          <p className="text-sm text-text-secondary">Welcome back to Professional Task Manager</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red"
                role="alert"
              >
                {errorMessage}
              </motion.div>
            )}
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email?.[0]}
              required
              autoComplete="email"
              prefix={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password?.[0]}
              required
              autoComplete="current-password"
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
            <div className="flex items-center justify-end">
              <Link href="/auth/reset-password" className="text-sm text-text-link hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={pending} className="w-full" icon={<LogIn className="h-4 w-4" />}>
              Sign In
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-text-link hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
