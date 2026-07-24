import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const user = await requireAuth();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: { userPreferences: true },
  });

  if (!profile) return null;

  return (
    <ProfileForm
      initialFirstName={profile.firstName}
      initialLastName={profile.lastName}
      initialEmail={profile.email}
      initialTheme={profile.userPreferences?.theme ?? 'system'}
      initialEmailEnabled={profile.userPreferences?.notificationEmailEnabled ?? true}
      initialInAppEnabled={profile.userPreferences?.notificationInAppEnabled ?? true}
    />
  );
}
