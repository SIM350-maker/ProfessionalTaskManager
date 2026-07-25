'use client';

import { cn } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

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
  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full gap-2.5', providerStyles[provider], className)}
      onClick={() => {
        window.location.href = `/api/v1/auth/${provider}`;
      }}
    >
      {icon}
      {children}
    </Button>
  );
}
