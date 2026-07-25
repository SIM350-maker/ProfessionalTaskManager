import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TeamMembersManager } from '@/components/teams/TeamMembersManager';

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('ADMINISTRATOR', 'MANAGER');
  const { id } = await params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        },
      },
    },
  });

  if (!team || team.organizationId !== user.organizationId) {
    notFound();
  }

  const memberIds = new Set(team.members.map((m) => m.userId));
  const availableUsers = await prisma.user.findMany({
    where: { organizationId: user.organizationId, deletedAt: null, isActive: true, id: { notIn: [...memberIds] } },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{team.name}</h1>
        {team.description && <p className="mt-1 text-text-secondary">{team.description}</p>}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text-primary">Members ({team.members.length})</h2>
        </CardHeader>
        <CardContent>
          <TeamMembersManager
            teamId={team.id}
            members={team.members}
            availableUsers={availableUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
