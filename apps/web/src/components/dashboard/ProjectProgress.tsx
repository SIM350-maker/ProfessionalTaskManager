"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";

interface ProjectProgressProps {
  projects: {
    id: string;
    name: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
  }[];
}

export function ProjectProgress({ projects }: ProjectProgressProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <Card>
      <CardHeader>Project Progress</CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => {
          const pct = project.totalTasks > 0 ? Math.round((project.completedTasks / project.totalTasks) * 100) : 0;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-lg border border-border-default p-4 transition-colors hover:bg-bg-hover"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary">{project.name}</p>
                <span className="text-xs text-text-secondary">{pct}%</span>
              </div>
              <ProgressBar value={pct} size="sm" variant={pct === 100 ? "success" : pct > 50 ? "default" : "warning"} />
              <p className="mt-1 text-xs text-text-tertiary">{project.completedTasks}/{project.totalTasks} tasks</p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
