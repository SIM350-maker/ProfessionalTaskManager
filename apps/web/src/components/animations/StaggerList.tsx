'use client';

import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface StaggerListProps {
  className?: string;
  staggerDelay?: number;
}

export function StaggerList({ children, className, staggerDelay = 0.05 }: PropsWithChildren<StaggerListProps>) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
