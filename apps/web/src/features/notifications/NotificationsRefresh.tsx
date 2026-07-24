'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationsRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs, queryClient]);

  return null;
}
