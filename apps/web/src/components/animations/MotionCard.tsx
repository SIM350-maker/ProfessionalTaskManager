'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';

interface MotionCardProps {
  className?: string;
  whileHover?: boolean;
  whileTap?: boolean;
  children?: React.ReactNode;
}

export function MotionCard({ children, className, whileHover = true, whileTap = true }: MotionCardProps) {
  return (
    <motion.div
      whileHover={whileHover ? { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : undefined}
      whileTap={whileTap ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border border-border-default bg-bg-card p-6 shadow-card',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
