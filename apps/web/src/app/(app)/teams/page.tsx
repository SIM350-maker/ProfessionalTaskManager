import type { Prisma } from '@generated/prisma/client';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { SearchBar } from '@/components/ui/search';
import { PageTransition } from '@/components/animations/PageTransition';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function TeamsPage({ searchParams }: PageProps) {
  const user = await requireRole('ADMINISTRATOR', 'MANAGER');
  const params = await searchParams;

  const where: Record<string, unknown> = { organizationId: user.organizationId, deletedAt: null };
  if (params.search) {
    where.name = { contains: params.search, mode: 'insensitive' };
  }

  const orderBy: Record<string, string> = {};
  const sort = params.sort || 'name_asc';
  const [sortField = 'name', sortDir = 'asc'] = sort.split('_');
  orderBy[sortField] = sortDir;

  const teams = await prisma.team.findMany({
    where: where as Prisma.TeamWhereInput,
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
    },
    orderBy,
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Teams</h1>
          <div className="flex items-center gap-3">
            <form method="GET" action="/teams" className="flex items-center gap-2">
              <SearchBar name="search" defaultValue={params.search} placeholder="Search teams..." />
              <select name="sort" defaultValue={params.sort || 'name_asc'} className="rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary">
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
            </form>
            <Link href="/teams/new"><Button>New Team</Button></Link>
          </div>
        </div>

        {teams.length === 0 ? (
          <EmptyState title="No teams found" description={params.search ? 'Try a different search term' : 'Create your first team to get started'} action={{ label: 'Create Team', href: '/teams/new' }} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StaggerList>
              {teams.map((team) => (
                <StaggerItem key={team.id}>
                  <Link href={`/teams/${team.id}`}>
                    <Card hover className="h-full cursor-pointer">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-text-primary">{team.name}</h3>
                        {team.description && <p className="mt-1 text-sm text-text-secondary">{team.description}</p>}
                        <div className="mt-4 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 4).map((m) => (
                              <Avatar key={m.userId} firstName={m.user.firstName} lastName={m.user.lastName} avatarUrl={m.user.avatarUrl} size="sm" className="ring-2 ring-bg-card" />
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">{team.members.length} members</span>
                        </div>
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
