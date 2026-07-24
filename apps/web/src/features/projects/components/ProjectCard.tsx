'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MotionCard } from '@/components/animations/MotionCard';
import type { ProjectWithRelations } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-project-status-planning',
  ACTIVE: 'bg-project-status-active',
  ON_HOLD: 'bg-project-status-onhold',
  COMPLETED: 'bg-project-status-completed',
  ARCHIVED: 'bg-project-status-archived',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

interface ProjectCardProps {
  project: ProjectWithRelations;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const taskCount = project._count?.tasks ?? 0;

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <MotionCard className="cursor-pointer">
        <div className="flex items-start gap-3">
          <span
            className={`mt-1 block h-3 w-3 shrink-0 rounded-full ${
              STATUS_COLORS[project.status] ?? 'bg-text-tertiary'
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-medium text-text-primary">
                {project.name}
              </h3>
              <Badge variant="outline" className="shrink-0">
                {STATUS_LABELS[project.status] ?? project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-text-tertiary">
                {project.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
              <span>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
              {project.owner && (
                <span>
                  {project.owner.firstName} {project.owner.lastName}
                </span>
              )}
            </div>
          </div>
        </div>
      </MotionCard>
    </Link>
  );
}
