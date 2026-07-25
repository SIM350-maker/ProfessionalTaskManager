'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SavedFilterView {
  id: string;
  name: string;
  params: {
    search: string;
    statuses: string[];
    priorities: string[];
    projectId: string;
    sortBy: string;
    sortOrder: string;
  };
}

const STORAGE_KEY = 'ptm:task-filter-views';

function readViews(): SavedFilterView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedFilterView[]) : [];
  } catch {
    return [];
  }
}

/** Saved task-filter views, persisted per-browser via localStorage (no server round-trip needed). */
export function useSavedFilterViews() {
  const [views, setViews] = useState<SavedFilterView[]>(() => readViews());

  const saveView = useCallback((name: string, params: SavedFilterView['params']) => {
    setViews((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), name, params }];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteView = useCallback((id: string) => {
    setViews((prev) => {
      const next = prev.filter((v) => v.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { views, saveView, deleteView };
}
