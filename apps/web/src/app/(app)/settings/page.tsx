import { prisma } from '@/lib/database';
import { requireAuth, hasPermission } from '@/lib/auth';
import { SettingsTabs } from './SettingsTabs';
import { getWorkflowsByOrg } from '@/services/workflows';
import { getCustomFieldsByOrg } from '@/services/custom-fields';
import { getAutomationRulesByOrg } from '@/services/automation';
import { getTaskTemplatesByOrg } from '@/services/task-templates';
import { PageTransition } from '@/components/animations/PageTransition';
import { Settings, Bell, Palette, Puzzle, Accessibility } from 'lucide-react';

const TABS = [
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'customization', label: 'Customization', icon: Puzzle },
] as const;

export default async function SettingsPage() {
  const user = await requireAuth();

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });

  const workflows = getWorkflowsByOrg ? await getWorkflowsByOrg(user.organizationId, 'TASK') : [];
  const customFields = getCustomFieldsByOrg ? await getCustomFieldsByOrg(user.organizationId, 'TASK') : [];
  const automationRules = getAutomationRulesByOrg ? await getAutomationRulesByOrg(user.organizationId) : [];
  const taskTemplates = getTaskTemplatesByOrg ? await getTaskTemplatesByOrg(user.organizationId) : [];

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
          tabs={TABS}
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
        />
      </div>
    </PageTransition>
  );
}
