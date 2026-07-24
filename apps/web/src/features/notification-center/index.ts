"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { NotificationWithActor } from "@/types";
import { formatDateTime } from "@/lib/helpers";

export type NotificationGroup = {
  date: string;
  label: string;
  notifications: NotificationWithActor[];
};

export function useNotifications(): {
  notifications: NotificationWithActor[];
  grouped: NotificationGroup[];
  isLoading: boolean;
  error: string | null;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => void;
} {
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      setNotifications(json.data as NotificationWithActor[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    try {
      const { markNotificationRead } = await import('@/actions');
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silently fail - optimistic update already applied
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const { markAllNotificationsRead } = await import('@/actions');
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  }, []);

  const grouped = useMemo<NotificationGroup[]>(() => {
    const groups = new Map<string, NotificationWithActor[]>();
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const notification of sorted) {
      const d = new Date(notification.createdAt);
      let label: string;
      if (d.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else if (d > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        label = "This Week";
      } else {
        label = "Earlier";
      }
      const key = `${label}_${d.toDateString()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(notification);
    }

    return Array.from(groups.entries()).map(([key, items]) => ({
      date: key.split("_")[1] ?? new Date().toDateString(),
      label: key.split("_")[0] ?? "Earlier",
      notifications: items,
    }));
  }, [notifications]);

  return {
    notifications,
    grouped,
    isLoading,
    error,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}

export function useUnreadCount(): { count: number; isLoading: boolean; refresh: () => void } {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (!res.ok) return;
      const json = await res.json();
      const unread = (json.data as NotificationWithActor[]).filter((n) => !n.isRead).length;
      setCount(unread);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCount();
  }, [fetchCount]);

  return { count, isLoading, refresh: fetchCount };
}

export function getNotificationLink(notification: NotificationWithActor): string {
  if (notification.actionUrl) return notification.actionUrl;
  return `/${notification.entityType.toLowerCase()}s/${notification.entityId}`;
}

export function formatNotificationTime(date: Date | string): string {
  return formatDateTime(date);
}
