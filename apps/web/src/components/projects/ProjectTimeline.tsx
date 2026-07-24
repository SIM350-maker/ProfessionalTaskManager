'use client';

import { useCallback, useEffect, useMemo, useState, Component, type ReactNode, type ErrorInfo } from 'react';
import { cn } from '@/lib/helpers';
import { AlertCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { GanttChart } from './GanttChart';
import { CalendarView } from './CalendarView';

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TimelineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TimelineErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-accent-red/30 bg-accent-red-light py-12 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-accent-red" />
            <h3 className="text-sm font-semibold text-accent-red">Something went wrong</h3>
            <p className="mt-1 text-xs text-accent-red">{(this.state.error as Error)?.message || 'An unexpected error occurred while rendering the timeline.'}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Task shape used by ProjectTimeline
// ---------------------------------------------------------------------------

interface ProjectTimelineTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  startDate: Date | string | null;
  dueDate: Date | string | null;
  assignees?: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }[];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProjectTimelineProps {
  projectId?: string;
  tasks?: ProjectTimelineTask[];
  initialTasks?: ProjectTimelineTask[];
}

type ViewMode = 'gantt' | 'calendar';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProjectTimeline({ projectId, tasks: directTasks, initialTasks }: ProjectTimelineProps) {
  const [view, setView] = useState<ViewMode>('gantt');
  const [tasks, setTasks] = useState<ProjectTimelineTask[]>(directTasks ?? initialTasks ?? []);
  const [loading, setLoading] = useState(!directTasks && !initialTasks);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/tasks?projectId=${encodeURIComponent(projectId)}&limit=100`);
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks (${res.status})`);
      }
      const json = await res.json();
      setTasks(json.data ?? []);
    } catch (err) {
      setError((err as Error).message || 'Unable to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!directTasks && !initialTasks && projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTasks();
    }
  }, [fetchTasks, directTasks, initialTasks, projectId]);

  const tabs = useMemo(
    () =>
      [
        { id: 'gantt' as ViewMode, label: 'Gantt Chart' },
        { id: 'calendar' as ViewMode, label: 'Calendar' },
      ] as const,
    [],
  );

  // --- Loading skeleton ---------------------------------------------------
  if (loading) {
    return (
      <div className="animate-fade-in space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="rounded-lg border border-border-default bg-bg-card p-4">
          <Skeleton variant="card" className="h-64" />
        </div>
      </div>
    );
  }

  // --- Error state --------------------------------------------------------
  if (error) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={
            <AlertTriangle className="h-12 w-12 text-accent-red" />
          }
          title="Failed to load timeline"
          description={error}
          action={{ label: 'Retry', href: '#', onClick: fetchTasks }}
        />
      </div>
    );
  }

  // --- Empty state --------------------------------------------------------
  if (tasks.length === 0) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={
            <Calendar className="h-12 w-12 text-text-tertiary" />
          }
          title="No tasks yet"
          description="Create your first task to see it on the timeline."
        />
      </div>
    );
  }

  // --- Main render --------------------------------------------------------
  return (
    <div className="animate-fade-in space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              view === tab.id
                ? 'bg-bg-card text-text-primary shadow-card'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View content */}
      {view === 'gantt' && (
        <TimelineErrorBoundary>
          <GanttChart tasks={tasks} />
        </TimelineErrorBoundary>
      )}
      {view === 'calendar' && (
        <TimelineErrorBoundary>
          <CalendarView tasks={tasks} />
        </TimelineErrorBoundary>
      )}
    </div>
  );
}
