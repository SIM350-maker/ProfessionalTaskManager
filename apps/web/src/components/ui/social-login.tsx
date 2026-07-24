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
      variant="outline"
      className={cn('w-full gap-2.5', providerStyles[provider], className)}
    >
      {icon}
      {children}
    </Button>
  );
}
