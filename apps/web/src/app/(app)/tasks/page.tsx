'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { AvatarGroup } from '@/components/ui/avatar';
import { formatDate, isOverdue } from '@/lib/helpers';
import { PageTransition } from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { CalendarView } from '@/components/projects/CalendarView';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers';
import { updateTaskStatus, updateTask } from '@/actions';
import { FileText, LayoutGrid, List, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import type { TaskWithRelations, TaskStatus, Priority } from '@/types';

function fetchJSON<T>(url: string): Promise<{ data: T }> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  });
}

type ViewMode = 'list' | 'board' | 'calendar';

const priorityBorder: Record<Priority, string> = {
  URGENT: 'border-l-accent-red',
  HIGH: 'border-l-accent-amber',
  MEDIUM: 'border-l-accent-blue',
  LOW: 'border-l-text-tertiary',
};

const TASK_PAGE_TITLES: Record<string, string> = {
  ADMINISTRATOR: 'All Tasks',
  MANAGER: 'Team Tasks',
  TEAM_MEMBER: 'My Tasks',
};

function InlineEditTitle({ title, taskId }: { title: string; taskId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  async function save() {
    if (value.trim() === title) { setIsEditing(false); return; }
    setSaving(true);
    const fd = new FormData();
    fd.set('title', value.trim());
    await updateTask(taskId, fd);
    setSaving(false);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setValue(title); setIsEditing(false); } }}
        className="rounded-md border border-accent-blue bg-bg-card px-2 py-0.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue/30"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-1 rounded-md px-1 -mx-1 text-left hover:bg-bg-hover transition-colors"
      title="Click to edit"
    >
      <span className="truncate font-medium text-text-primary">{title}</span>
      <span className="hidden group-hover:inline text-[10px] text-text-tertiary">edit</span>
    </button>
  );
}

export default function TasksPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role ?? 'TEAM_MEMBER';
  const isTeamMember = role === 'TEAM_MEMBER';
  const [view, setView] = useState<ViewMode>('list');

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', '100');
    return params.toString();
  }, [searchParams]);

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', role, queryString],
    queryFn: () => fetchJSON<TaskWithRelations[]>(`/api/v1/tasks?${queryString}`),
    enabled: !!user,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchJSON<{ id: string; name: string }[]>('/api/v1/projects?limit=100'),
    staleTime: 60 * 1000,
    enabled: !isTeamMember,
  });

  const tasks = tasksData?.data ?? [];
  const projects = projectsData?.data ?? [];
  const loading = tasksLoading || (!isTeamMember && projectsLoading);

  const statusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      await updateTaskStatus(taskId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    statusMutation.mutate({ taskId, newStatus });
  }

  const calendarTasks = useMemo(() => tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignees: t.assignees,
  })), [tasks]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            {TASK_PAGE_TITLES[role] ?? 'Tasks'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-border-default">
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  view === 'list'
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-hover',
                )}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              {!isTeamMember && (
                <button
                  type="button"
                  onClick={() => setView('board')}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                    view === 'board'
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-card text-text-secondary hover:bg-bg-hover',
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Board</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  view === 'calendar'
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-hover',
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>
            <Link href="/tasks/new">
              <Button>New Task</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton variant="card" className="h-10 w-40" />
              {!isTeamMember && <Skeleton variant="card" className="h-10 w-40" />}
              <Skeleton variant="card" className="h-10 w-40" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : view === 'board' && !isTeamMember ? (
          <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
        ) : view === 'calendar' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CalendarView tasks={calendarTasks} />
          </motion.div>
        ) : (
          <>
            {!isTeamMember && <TaskFilters projects={projects} />}
            {isTeamMember && (
              <div className="text-sm text-text-secondary">
                Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
              </div>
            )}
            <Card variant="elevated">
              <CardContent className="pt-6">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FileText className="mb-3 h-12 w-12 text-text-tertiary" strokeWidth={1} />
                    <p className="text-sm text-text-tertiary">No tasks found.</p>
                  </div>
                ) : (
                  <StaggerList className="space-y-2">
                    {tasks.map((task) => (
                      <StaggerItem key={task.id}>
                        <Link
                          href={`/tasks/${task.id}`}
                          className={cn(
                            'flex items-center justify-between rounded-lg border border-border-default p-4 transition-all duration-[var(--duration-fast)] hover:bg-bg-hover border-l-[3px] group',
                            priorityBorder[task.priority],
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <InlineEditTitle title={task.title} taskId={task.id} />
                              {isOverdue(task.dueDate) && task.status !== 'DONE' && (
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="rounded bg-accent-red-light px-1.5 py-0.5 text-xs font-medium text-accent-red"
                                >
                                  Overdue
                                </motion.span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-text-secondary">{task.project.name}</p>
                            <div className="mt-2">
                              <AvatarGroup users={task.assignees.map((a) => a.user)} size="sm" max={4} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                            {task.dueDate && (
                              <span className={cn(
                                'text-sm whitespace-nowrap transition-colors',
                                isOverdue(task.dueDate) && task.status !== 'DONE'
                                  ? 'font-medium text-accent-red'
                                  : 'text-text-secondary',
                              )}>
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </Link>
                      </StaggerItem>
                    ))}
                  </StaggerList>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTransition>
  );
}
