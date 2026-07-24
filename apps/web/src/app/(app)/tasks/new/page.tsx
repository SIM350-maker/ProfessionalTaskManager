import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import NewTaskForm from './NewTaskForm';

export default async function NewTaskPage() {
  const user = await requireRole('ADMINISTRATOR', 'MANAGER');

  const [projects, users] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId: user.organizationId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { organizationId: user.organizationId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
  ]);

  return <NewTaskForm projects={projects} users={users} organizationId={user.organizationId} />;
}
