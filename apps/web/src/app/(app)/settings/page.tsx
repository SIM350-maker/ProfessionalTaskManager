import { prisma } from '@/lib/database';
import { requireAuth, hasPermission } from '@/lib/auth';
import { SettingsTabs } from './SettingsTabs.client';
import { getWorkflowsByOrg } from '@/services/workflows';
import { getCustomFieldsByOrg } from '@/services/custom-fields';
import { getAutomationRulesByOrg } from '@/services/automation';
import { getTaskTemplatesByOrg } from '@/services/task-templates';
import { PageTransition } from '@/components/animations/PageTransition';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
  const user = await requireAuth();

  const [prefs, organization] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId: user.id } }),
    prisma.organization.findUnique({ where: { id: user.organizationId }, select: { settings: true } }),
  ]);

  const workflows = await getWorkflowsByOrg(user.organizationId, 'TASK');
  const customFields = await getCustomFieldsByOrg(user.organizationId, 'TASK');
  const automationRules = await getAutomationRulesByOrg(user.organizationId);
  const taskTemplates = await getTaskTemplatesByOrg(user.organizationId);

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
