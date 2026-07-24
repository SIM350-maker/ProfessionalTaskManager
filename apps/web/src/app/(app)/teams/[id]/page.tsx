import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

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
          {team.members.length === 0 ? (
            <p className="text-sm text-text-secondary">No members yet.</p>
          ) : (
            <div className="divide-y">
              {team.members.map((member) => (
                <div key={member.userId} className="flex items-center gap-3 py-3">
                  <Avatar {...member.user} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{member.user.firstName} {member.user.lastName}</p>
                    <p className="text-xs text-text-secondary">{member.user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
