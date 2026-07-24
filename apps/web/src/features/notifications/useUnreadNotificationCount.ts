'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useUnreadNotificationCount(pollInterval = 30000) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications?action=unread-count', {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.data?.count ?? 0);
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, pollInterval);
    return () => clearInterval(interval);
  }, [fetchCount, pollInterval]);

  return { count, loading, refetch: fetchCount };
}

export function useNotifications() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/v1/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });

  const { count: unreadCount } = useUnreadNotificationCount(30000);

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      if (notificationId) {
        await fetch(`/api/v1/notifications/${notificationId}/read`, { method: 'POST' });
      } else {
        await fetch('/api/v1/notifications/read-all', { method: 'POST' });
      }
      refetch();
    } catch {
      // ignore
    }
  }, [refetch]);

  return {
    notifications: data?.data ?? [],
    unreadCount,
    markAsRead,
  };
}
