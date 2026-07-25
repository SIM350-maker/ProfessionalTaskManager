'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationWithActor } from '@/types';

interface StreamPayload {
  unreadCount: number;
  notifications: NotificationWithActor[];
}

/**
 * Subscribes to the /api/v1/notifications/stream SSE feed. EventSource handles
 * reconnection natively on drop, so no manual retry loop is needed.
 */
function useNotificationStream() {
  const [payload, setPayload] = useState<StreamPayload>({ unreadCount: 0, notifications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = new EventSource('/api/v1/notifications/stream');

    source.addEventListener('notifications', (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as StreamPayload;
      setPayload(data);
      setLoading(false);
    });

    source.onerror = () => {
      setLoading(false);
    };

    return () => source.close();
  }, []);

  return { payload, setPayload, loading };
}

export function useUnreadNotificationCount() {
  const { payload, loading } = useNotificationStream();
  return { count: payload.unreadCount, loading, refetch: () => {} };
}

export function useNotifications() {
  const { payload, setPayload } = useNotificationStream();
  const payloadRef = useRef(payload);

  useEffect(() => {
    payloadRef.current = payload;
  });

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      if (notificationId) {
        await fetch(`/api/v1/notifications/${notificationId}/read`, { method: 'POST' });
      } else {
        await fetch('/api/v1/notifications/read-all', { method: 'POST' });
      }
      setPayload((prev) => ({
        unreadCount: notificationId ? Math.max(0, prev.unreadCount - 1) : 0,
        notifications: prev.notifications.map((n) =>
          !notificationId || n.id === notificationId ? { ...n, isRead: true } : n,
        ),
      }));
    } catch {
      // ignore — the next stream tick will reconcile
    }
  }, [setPayload]);

  return {
    notifications: payload.notifications,
    unreadCount: payload.unreadCount,
    markAsRead,
  };
}
