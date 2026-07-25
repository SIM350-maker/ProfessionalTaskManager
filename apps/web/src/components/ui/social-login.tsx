'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonProps {
  provider: 'google' | 'github' | 'microsoft';
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const providerStyles: Record<string, string> = {
  google: 'border-border-default bg-bg-card text-text-primary hover:bg-bg-hover',
  github: 'border-border-default bg-bg-card text-text-primary hover:bg-bg-hover',
  microsoft: 'border-border-default bg-bg-card text-text-primary hover:bg-bg-hover',
};

export function SocialLoginButton({ provider, icon, className, children }: SocialLoginButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) return;
    const timeout = setTimeout(() => setIsNavigating(false), 4000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full gap-2.5', providerStyles[provider], className)}
      onClick={() => {
        setIsNavigating(true);
        window.location.href = `/api/v1/auth/${provider}`;
      }}
      disabled={isNavigating}
    >
      {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </Button>
  );
}
