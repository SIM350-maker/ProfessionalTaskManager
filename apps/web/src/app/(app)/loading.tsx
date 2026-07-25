'use client';

import { useState, useEffect } from 'react';

export default function AppLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 2400;

    function tick(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex h-screen">
      <div className="fixed inset-x-0 top-0 z-50 h-1 w-full overflow-hidden bg-border-default">
        <div
          className="h-full bg-accent-blue transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <aside className="flex w-64 flex-col gap-4 border-r border-border-default bg-bg-sidebar p-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-4 w-24" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-36" />
          <div className="skeleton h-4 w-44" />
          <div className="skeleton h-4 w-32" />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-bg-subtle p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="skeleton h-8 w-64" />
            <div className="text-sm font-medium text-text-secondary">{progress}%</div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="skeleton h-32 rounded-lg" />
            <div className="skeleton h-32 rounded-lg" />
            <div className="skeleton h-32 rounded-lg" />
          </div>
          <div className="mt-8">
            <div className="skeleton mb-4 h-6 w-48" />
            <div className="skeleton h-64 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
