import { prisma } from '@/lib/database';
import { requireAuth, hasPermission } from '@/lib/auth';
import { SettingsTabs } from './SettingsTabs.client';
import { getWorkflowsByOrg } from '@/services/workflows';
import { getCustomFieldsByOrg } from '@/services/custom-fields';
import { getAutomationRulesByOrg } from '@/services/automation';
import { getTaskTemplatesByOrg } from '@/services/task-templates';
import { PageTransition } from '@/components/animations/PageTransition';
import { Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function SettingsPage() {
  const user = await requireAuth();

  const [prefs, organization] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId: user.id } }),
    user.organizationId ? prisma.organization.findUnique({ where: { id: user.organizationId }, select: { settings: true } }) : Promise.resolve(null),
  ]);

  const workflows = user.organizationId ? await getWorkflowsByOrg(user.organizationId, 'TASK') : [];
  const customFields = user.organizationId ? await getCustomFieldsByOrg(user.organizationId, 'TASK') : [];
  const automationRules = user.organizationId ? await getAutomationRulesByOrg(user.organizationId) : [];
  const taskTemplates = user.organizationId ? await getTaskTemplatesByOrg(user.organizationId) : [];

  const orgSettings = (organization?.settings ?? {}) as { slackWebhookUrl?: string };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary">Manage your account and preferences</p>
          </div>
        </div>

        {user.isPersonalMode && (
          <Card variant="elevated" className="border-accent-blue/30 bg-accent-blue-light/20">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue-light text-accent-blue">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Upgrade to Organization Mode</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Collaborate with your team, assign roles, and unlock advanced features like workflows, automation, and reports.
                  </p>
                </div>
              </div>
              <Link href="/auth/register?mode=ORGANIZATION">
                <Button className="shrink-0">Create Organization</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <SettingsTabs
          initialEmailEnabled={prefs?.notificationEmailEnabled ?? true}
          initialInAppEnabled={prefs?.notificationInAppEnabled ?? true}
          initialTheme={prefs?.theme ?? 'system'}
          initialLanguage={prefs?.language ?? 'en'}
          workflows={workflows}
          customFields={customFields}
          automationRules={automationRules}
          taskTemplates={taskTemplates}
          canManageWorkflow={hasPermission(user.role, 'workflow:manage')}
          canManageCustomField={hasPermission(user.role, 'customField:manage')}
          canManageAutomation={hasPermission(user.role, 'automation:manage')}
          canManageTemplate={hasPermission(user.role, 'template:manage')}
          canManageOrganization={hasPermission(user.role, 'organization:update')}
          initialSlackWebhookUrl={orgSettings.slackWebhookUrl ?? ''}
        />
      </div>
    </PageTransition>
  );
}
