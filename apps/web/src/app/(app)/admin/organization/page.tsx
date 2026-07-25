import { prisma } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/animations/PageTransition';
import { Building, Users, BarChart3, Save } from 'lucide-react';
import { formatDateTime } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export default async function OrganizationSettingsPage() {
  const user = await requireRole('ADMINISTRATOR');

  if (!user.organizationId) {
    return null;
  }

  const [org, memberCount, projectCount] = await Promise.all([
    prisma.organization.findUnique({ where: { id: user.organizationId } }),
    prisma.user.count({ where: { organizationId: user.organizationId, isActive: true } }),
    prisma.project.count({ where: { organizationId: user.organizationId, deletedAt: null } }),
  ]);

  if (!org) return null;

  const updateOrg = async (formData: FormData) => {
    'use server';
    const admin = await requireRole('ADMINISTRATOR');
    if (!admin.organizationId) {
      return;
    }
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const defaultTimezone = formData.get('defaultTimezone') as string;

    await prisma.organization.update({
      where: { id: admin.organizationId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(defaultTimezone && { defaultTimezone }),
      },
    });

    revalidatePath('/admin/organization');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building className="h-7 w-7 text-text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Organization Settings</h1>
            <p className="text-sm text-text-secondary">Manage your organization details and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue-light text-accent-blue">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{memberCount}</p>
                <p className="text-xs text-text-secondary">Active Members</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green-light text-accent-green">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{projectCount}</p>
                <p className="text-xs text-text-secondary">Active Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="kpi">
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-amber-light text-accent-amber">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary capitalize">{org.subscriptionTier?.toLowerCase() ?? 'Free'}</p>
                <p className="text-xs text-text-secondary">Subscription Tier</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Organization Details</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updateOrg} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Organization Name"
                  name="name"
                  defaultValue={org.name}
                  required
                />
                <Input
                  label="Slug"
                  name="slug"
                  defaultValue={org.slug}
                  required
                  helperText="Used in URLs"
                />
                <Input
                  label="Default Timezone"
                  name="defaultTimezone"
                  defaultValue={org.defaultTimezone}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-primary">Created</label>
                  <div className="flex h-10 items-center rounded-lg border border-border-default bg-bg-card px-3 text-sm text-text-secondary">
                    {formatDateTime(org.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" icon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
