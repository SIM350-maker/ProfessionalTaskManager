import type { Prisma } from "@generated/prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/database";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search";
import { PageTransition } from "@/components/animations/PageTransition";
import { StaggerList, StaggerItem } from "@/components/animations/StaggerList";
import { EmptyState } from "@/components/ui/EmptyState";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const user = await requireRole('ADMINISTRATOR', 'MANAGER');
  const params = await searchParams;

  const where: Record<string, unknown> = {
    organizationId: user.organizationId,
    deletedAt: null,
  };

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.status) where.status = params.status;

  const orderBy: Record<string, string> = {};
  const sort = params.sort || "createdAt_desc";
  const [sortField = "createdAt", sortDir = "desc"] = sort.split("_");
  orderBy[sortField] = sortDir;

  const projects = await prisma.project.findMany({
    where: where as Prisma.ProjectWhereInput,
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { tasks: true } },
    },
    orderBy,
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <div className="flex items-center gap-3">
            <form method="GET" action="/projects" className="flex items-center gap-2">
              <SearchBar
                name="search"
                defaultValue={params.search}
                placeholder="Search projects..."
              />
              <select
                name="status"
                defaultValue={params.status || ""}
                className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
              >
                <option value="">All Status</option>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                name="sort"
                defaultValue={params.sort || "createdAt_desc"}
                className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
              <input type="hidden" name="search" value={params.search || ""} />
            </form>
            <Link href="/projects/new">
              <Button>New Project</Button>
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description={
              params.search
                ? "Try a different search term"
                : "Create your first project to get started"
            }
            action={{ label: "Create Project", href: "/projects/new" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StaggerList>
              {projects.map((project) => (
                <StaggerItem key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <Card hover className="h-full cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          {project.color && (
                            <div
                              className="h-4 w-4 shrink-0 rounded-full"
                              data-color={project.color}
                              style={{ backgroundColor: project.color }}
                            />
                          )}
                          <h3 className="truncate text-lg font-semibold text-text-primary">{project.name}</h3>
                        </div>
                        {project.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <StatusBadge status={project.status} />
                          <span className="text-sm text-text-secondary">
                            {project._count.tasks} tasks
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-text-tertiary">
                          Owner: {project.owner.firstName} {project.owner.lastName}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
