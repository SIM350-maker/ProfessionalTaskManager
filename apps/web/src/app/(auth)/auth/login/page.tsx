'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChevronDown, Shield, Fingerprint, Globe, Code2, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SocialLoginButton } from '@/components/ui/social-login';
import { MfaForm } from '@/components/auth/mfa-form';

type DemoAccount = {
  label: string;
  email: string;
  password: string;
  role: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'James Kariuki', email: 'james.kariuki@safaricom-plc.com', password: 'Pinned123!', role: 'Administrator' },
  { label: 'Faith Akinyi', email: 'faith.akinyi@equity-bank-kenya.com', password: 'Pinned123!', role: 'Manager' },
  { label: 'Daniel Kiprono', email: 'daniel.kiprono@kengen.com', password: 'Pinned123!', role: 'Team Member' },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  Administrator: 'bg-accent-purple-light text-accent-purple',
  Manager: 'bg-accent-blue-light text-accent-blue',
  'Team Member': 'bg-accent-green-light text-accent-green',
};

type LoginStep = 'credentials' | 'mfa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function fillCredentials(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { loginUser } = await import('@/actions');
    const result = await loginUser(formData);

    if (result.success) {
      router.push('/dashboard');
      return;
    }
    setError('Invalid email or password');
    setLoading(false);
  }

  async function handleMfaVerify(code: string) {
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 1200));
    if (code === '000000') {
      router.push('/dashboard');
      return { success: true };
    }
    setLoading(false);
    setError('Invalid verification code. Try 000000 for demo.');
    return { success: false, error: 'Invalid code' };
  }

  if (step === 'mfa') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="text-sm text-text-link hover:underline"
            >
              &larr; Back to login
            </button>
          </div>
          <MfaForm onVerify={handleMfaVerify} email={email} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto w-full max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-lg">
            <Fingerprint className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Sign in</h1>
          <p className="text-sm text-text-secondary">Welcome back to Professional Task Manager</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="lg">
            <div className="space-y-3">
              <SocialLoginButton provider="google" icon={<Globe className="h-4 w-4" />}>
                Continue with Google
              </SocialLoginButton>
              <SocialLoginButton provider="github" icon={<Code2 className="h-4 w-4" />}>
                Continue with GitHub
              </SocialLoginButton>
              <SocialLoginButton provider="microsoft" icon={<Apple className="h-4 w-4" />}>
                Continue with Microsoft
              </SocialLoginButton>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg-card px-3 text-text-tertiary">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                prefix={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default text-accent-blue focus:ring-accent-blue"
                  />
                  Remember me
                </label>
                <Link href="/auth/reset-password" className="text-sm text-text-link hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-medium text-text-link hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="inline-flex items-center gap-1">
              Demo credentials
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`} />
            </span>
          </button>
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 text-left overflow-hidden"
              >
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillCredentials(account)}
                    className="flex w-full items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5 transition-colors hover:border-accent-blue hover:bg-accent-blue-light/40"
                  >
                    <div>
                      <div className="text-sm font-medium text-text-primary">{account.label}</div>
                      <div className="text-xs text-text-tertiary">{account.email}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE_COLORS[account.role]}`}>
                      {account.role}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setStep('mfa')}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <Shield className="h-3 w-3" />
            Use MFA instead
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <Card variant="elevated" padding="md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">Secure task management</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Enterprise-grade security with two-factor authentication, SSO, and audit logging.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
