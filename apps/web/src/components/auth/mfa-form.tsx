'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface MfaFormProps {
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  email?: string;
}

export function MfaForm({ onVerify, email }: MfaFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      setLoading(false);
      return;
    }
    const result = await onVerify(fullCode);
    if (!result.success) {
      setError(result.error || 'Invalid code');
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-blue" />
            <h1 className="text-xl font-bold text-text-primary">
              {isSetup ? 'Set Up Two-Factor Authentication' : 'Two-Factor Authentication'}
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            {isSetup
              ? 'Scan the QR code with your authenticator app'
              : `Enter the 6-digit code from your authenticator app${email ? ` for ${email}` : ''}`}
          </p>
        </CardHeader>
        <CardContent>
          {isSetup ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg border border-border-default bg-bg-subtle p-8">
                <div className="h-40 w-40 rounded-lg bg-bg-card" />
              </div>
              <div className="rounded-lg border border-accent-amber-light bg-accent-amber-light/40 p-3 text-sm text-accent-amber">
                <strong>Setup Key:</strong> JBSWY3DPEHPK3PXP
              </div>
              <Button className="w-full" onClick={() => setIsSetup(false)}>
                I have set up my authenticator
              </Button>
            </div>
          ) : (
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
              <div className="flex items-center justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-14 w-12 rounded-lg border border-border-default bg-bg-card text-center text-xl font-semibold text-text-primary transition-all focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
                  />
                ))}
              </div>
              <Button type="submit" loading={loading} className="w-full" icon={<KeyRound className="h-4 w-4" />}>
                Verify Code
              </Button>
              <p className="text-center text-xs text-text-tertiary">
                Lost your device?{' '}
                <button type="button" className="text-text-link hover:underline">
                  Use a recovery code
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
