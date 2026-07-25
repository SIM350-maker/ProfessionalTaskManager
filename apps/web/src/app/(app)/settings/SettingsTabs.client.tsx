'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Monitor, Sun, Moon, Save, Eye, EyeOff, Puzzle, Accessibility, MessageSquare, Calendar, Copy, Check, RefreshCw, Plug, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getActionErrorMessage } from '@/lib/helpers';
import type { Workflow, WorkflowState, CustomFieldDefinition, AutomationRule, TaskTemplate } from '@/types';

const TABS = [
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'customization', label: 'Customization', icon: Puzzle },
  { id: 'integrations', label: 'Integrations', icon: Plug },
] as const;

interface SettingsTabsProps {
  initialEmailEnabled: boolean;
  initialInAppEnabled: boolean;
  initialTheme: string;
  initialLanguage: string;
  workflows: (Workflow & { states: WorkflowState[] })[];
  customFields: CustomFieldDefinition[];
  automationRules: AutomationRule[];
  taskTemplates: TaskTemplate[];
  canManageWorkflow: boolean;
  canManageCustomField: boolean;
  canManageAutomation: boolean;
  canManageTemplate: boolean;
  canManageOrganization: boolean;
  initialSlackWebhookUrl: string;
}

export function SettingsTabs({
  initialEmailEnabled,
  initialInAppEnabled,
  initialTheme,
  initialLanguage,
  workflows,
  customFields,
  automationRules,
  taskTemplates,
  canManageWorkflow,
  canManageCustomField,
  canManageAutomation,
  canManageTemplate,
  canManageOrganization,
  initialSlackWebhookUrl,
}: SettingsTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [inAppEnabled, setInAppEnabled] = useState(initialInAppEnabled);
  const [theme, setTheme] = useState(initialTheme);
  const [language] = useState(initialLanguage);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(initialSlackWebhookUrl);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const { changePassword } = await import('@/actions');
      const result = await changePassword(formData);
      setMessageType(result.success ? 'success' : 'error');
      setMessage(result.success ? 'Password changed successfully.' : 'Failed to change password.');
      if (result.success) router.refresh();
    } catch {
      setMessageType('error');
      setMessage('An unexpected error occurred.');
    }
    setLoading(false);
  }

  async function handlePreferencesSave() {
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('notificationEmailEnabled', String(emailEnabled));
      formData.set('notificationInAppEnabled', String(inAppEnabled));
      formData.set('theme', theme);
      formData.set('language', language);
      const { updateNotificationPreferences } = await import('@/actions');
      const result = await updateNotificationPreferences(formData);
      setMessageType(result.success ? 'success' : 'error');
      setMessage(result.success ? 'Preferences updated.' : 'Failed to update preferences.');
      if (result.success) router.refresh();
    } catch {
      setMessageType('error');
      setMessage('An unexpected error occurred.');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (activeTab !== 'integrations' || calendarUrl) return;
    setCalendarLoading(true);
    import('@/actions').then(async ({ getCalendarFeedUrl }) => {
      const result = await getCalendarFeedUrl();
      if (result.success && result.data) setCalendarUrl(result.data.url);
      setCalendarLoading(false);
    });
  }, [activeTab, calendarUrl]);

  async function handleSlackSave() {
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.set('slackWebhookUrl', slackWebhookUrl);
    const { updateSlackWebhook } = await import('@/actions');
    const result = await updateSlackWebhook(formData);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.success ? 'Slack integration updated.' : getActionErrorMessage(result.error));
    setLoading(false);
  }

  async function handleRegenerateCalendarUrl() {
    setCalendarLoading(true);
    const { regenerateCalendarFeedToken } = await import('@/actions');
    const result = await regenerateCalendarFeedToken();
    if (result.success && result.data) setCalendarUrl(result.data.url);
    setCalendarLoading(false);
  }

  async function handleCopyCalendarUrl() {
    await navigator.clipboard.writeText(calendarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-text-secondary" />
                  <h2 className="text-lg font-semibold text-text-primary">Account Information</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-text-secondary">
                  Your account details are managed in your profile settings.
                </p>
                <Button variant="secondary" onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-text-secondary" />
                  <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    suffix={
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="text-text-tertiary hover:text-text-secondary">
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <Input
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    helperText="At least 8 characters with a letter and number"
                    suffix={
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-text-tertiary hover:text-text-secondary">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <div className="flex justify-end">
                    <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Notification Preferences</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default text-accent-blue focus:ring-accent-blue"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                    <p className="text-xs text-text-secondary">Task assigned, due dates, comments</p>
                  </div>
                  <Badge variant={emailEnabled ? 'success' : 'default'}>
                    {emailEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-default p-3 transition-colors hover:bg-bg-hover">
                  <input
                    type="checkbox"
                    checked={inAppEnabled}
                    onChange={(e) => setInAppEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default text-accent-blue focus:ring-accent-blue"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">In-App Notifications</p>
                    <p className="text-xs text-text-secondary">Notification bell and toast messages</p>
                  </div>
                  <Badge variant={inAppEnabled ? 'success' : 'default'}>
                    {inAppEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </label>
                <div className="flex justify-end pt-2">
                  <Button type="button" loading={loading} icon={<Save className="h-4 w-4" />} onClick={handlePreferencesSave}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'theme':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Theme Settings</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-text-secondary">Choose your preferred appearance for the application.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun, desc: 'Clean light theme' },
                    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark mode' },
                    { value: 'system', label: 'System', icon: Monitor, desc: 'Follows system setting' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-3 rounded-lg border p-6 transition-all ${
                        theme === value
                          ? 'border-accent-blue bg-accent-blue-light text-accent-blue ring-1 ring-accent-blue'
                          : 'border-border-default text-text-secondary hover:border-border-hover hover:bg-bg-hover'
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                      <div className="text-center">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="button" loading={loading} icon={<Save className="h-4 w-4" />} onClick={handlePreferencesSave}>
                    Save Theme
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'customization':
        return (
          <div className="space-y-6">
            {canManageWorkflow && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-text-secondary" />
                      <h2 className="text-lg font-semibold text-text-primary">Workflows</h2>
                    </div>
                    <Badge variant="default">{workflows.length} configured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {workflows.length === 0 ? (
                    <p className="text-sm text-text-tertiary">No workflows found.</p>
                  ) : (
                    <div className="space-y-2">
                      {workflows.map((wf) => (
                        <div key={wf.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{wf.name}</p>
                            <p className="text-xs text-text-secondary">
                              {(wf as Workflow & { states?: Array<{ id: string }> }).states?.length ?? 0} states
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {canManageCustomField && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-text-secondary" />
                      <h2 className="text-lg font-semibold text-text-primary">Custom Fields</h2>
                    </div>
                    <Badge variant="default">{customFields.length} configured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {customFields.length === 0 ? (
                    <p className="text-sm text-text-tertiary">No custom fields found.</p>
                  ) : (
                    <div className="space-y-2">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{field.name}</p>
                            <p className="text-xs text-text-secondary">{field.type} &middot; Key: {field.key}</p>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {canManageAutomation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-text-secondary" />
                      <h2 className="text-lg font-semibold text-text-primary">Automation Rules</h2>
                    </div>
                    <Badge variant="default">{automationRules.length} configured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {automationRules.length === 0 ? (
                    <p className="text-sm text-text-tertiary">No automation rules found.</p>
                  ) : (
                    <div className="space-y-2">
                      {automationRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{rule.name}</p>
                            <p className="text-xs text-text-secondary">
                              {rule.trigger} &middot; {rule.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {canManageTemplate && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5 text-text-secondary" />
                      <h2 className="text-lg font-semibold text-text-primary">Task Templates</h2>
                    </div>
                    <Badge variant="default">{taskTemplates.length} configured</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {taskTemplates.length === 0 ? (
                    <p className="text-sm text-text-tertiary">No task templates found.</p>
                  ) : (
                    <div className="space-y-2">
                      {taskTemplates.map((tpl) => (
                        <div key={tpl.id} className="flex items-center justify-between rounded-lg border border-border-default p-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{tpl.name}</p>
                            <p className="text-xs text-text-secondary">
                              {tpl.defaultPriority} &middot; {tpl.isRecurring ? 'Recurring' : 'One-time'}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-text-secondary" />
                  <h2 className="text-lg font-semibold text-text-primary">Calendar Feed</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-text-secondary">
                  Subscribe to this URL from Google Calendar, Outlook, or Apple Calendar to see your
                  assigned tasks with due dates. Anyone with this link can view your task due dates,
                  so keep it private.
                </p>
                {calendarLoading && !calendarUrl ? (
                  <p className="text-sm text-text-tertiary">Loading...</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input value={calendarUrl} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="sm" onClick={handleCopyCalendarUrl} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" loading={calendarLoading} onClick={handleRegenerateCalendarUrl} icon={<RefreshCw className="h-3.5 w-3.5" />}>
                      Regenerate link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {canManageOrganization && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-text-secondary" />
                    <h2 className="text-lg font-semibold text-text-primary">Slack Notifications</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-text-secondary">
                    Paste a Slack incoming webhook URL to post a message whenever a task is completed
                    or an automation rule sends a notification.
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="Webhook URL"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <div className="flex justify-end">
                      <Button type="button" loading={loading} icon={<Save className="h-4 w-4" />} onClick={handleSlackSave}>
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'accessibility':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Accessibility</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Font Size</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large', 'extra-large'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'medium' ? '16px' : size === 'large' ? '18px' : '20px';
                          localStorage.setItem('font-size', size);
                        }}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          localStorage.getItem('font-size') === size || (!localStorage.getItem('font-size') && size === 'medium')
                            ? 'border-accent-blue bg-accent-blue-light text-accent-blue'
                            : 'border-border-default text-text-secondary hover:bg-bg-hover'
                        }`}
                      >
                        {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Contrast</label>
                  <div className="flex gap-2">
                    {['normal', 'high'].map((contrast) => (
                      <button
                        key={contrast}
                        type="button"
                        onClick={() => {
                          document.documentElement.classList.toggle('high-contrast', contrast === 'high');
                          localStorage.setItem('contrast', contrast);
                        }}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          localStorage.getItem('contrast') === contrast || (!localStorage.getItem('contrast') && contrast === 'normal')
                            ? 'border-accent-blue bg-accent-blue-light text-accent-blue'
                            : 'border-border-default text-text-secondary hover:bg-bg-hover'
                        }`}
                      >
                        {contrast === 'high' ? 'High Contrast' : 'Normal'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border-default p-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Reduced Motion</p>
                    <p className="text-xs text-text-secondary">Minimize animations throughout the interface</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = localStorage.getItem('reduced-motion') === 'true';
                      localStorage.setItem('reduced-motion', String(!current));
                      if (!current) {
                        document.documentElement.style.setProperty('--duration-fast', '0ms');
                        document.documentElement.style.setProperty('--duration-normal', '0ms');
                        document.documentElement.style.setProperty('--duration-slow', '0ms');
                      } else {
                        document.documentElement.style.setProperty('--duration-fast', '150ms');
                        document.documentElement.style.setProperty('--duration-normal', '200ms');
                        document.documentElement.style.setProperty('--duration-slow', '300ms');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localStorage.getItem('reduced-motion') === 'true' ? 'bg-accent-blue' : 'bg-bg-hover'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-text-inverse transition-transform ${
                      localStorage.getItem('reduced-motion') === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-3 text-sm ${
            messageType === 'success'
              ? 'bg-accent-green-light text-accent-green'
              : 'bg-accent-red-light text-accent-red'
          }`}
        >
          {message}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-1 rounded-lg border border-border-default bg-bg-card p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-blue text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </div>
  );
}
