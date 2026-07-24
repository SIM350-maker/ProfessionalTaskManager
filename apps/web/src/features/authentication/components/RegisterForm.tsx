'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { registerUser } from '@/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface FieldErrors {
  firstName?: string[];
  lastName?: string[];
  email?: string[];
  password?: string[];
  organizationName?: string[];
}

interface FormState {
  success: boolean;
  error?: { message?: string; _errors?: FieldErrors };
  data?: unknown;
}

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev: FormState, formData: FormData) => {
      const result = await registerUser(formData) as FormState;
      if (result.success) {
        router.push('/auth/login');
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
          <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="text-sm text-text-secondary">Start managing your team&apos;s work</p>
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={fieldErrors.firstName?.[0]}
                required
                prefix={<User className="h-4 w-4" />}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={fieldErrors.lastName?.[0]}
                required
                prefix={<User className="h-4 w-4" />}
              />
            </div>
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
              autoComplete="new-password"
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
            <Input
              label="Organization Name"
              name="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              error={fieldErrors.organizationName?.[0]}
              required
              prefix={<User className="h-4 w-4" />}
            />
            <Button type="submit" loading={pending} className="w-full" icon={<UserPlus className="h-4 w-4" />}>
              Create Account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-text-link hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
