'use client';

import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface PageTransitionProps {
  className?: string;
}

export function PageTransition({ children, className }: PropsWithChildren<PageTransitionProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
