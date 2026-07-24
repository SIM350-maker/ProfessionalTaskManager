'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SettingsFormProps {
  initialEmailEnabled: boolean;
  initialInAppEnabled: boolean;
  initialTheme: string;
  initialLanguage: string;
}

export function SettingsForm({ initialEmailEnabled, initialInAppEnabled, initialTheme, initialLanguage }: SettingsFormProps) {
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [inAppEnabled, setInAppEnabled] = useState(initialInAppEnabled);
  const [theme, setTheme] = useState(initialTheme);
  const [language] = useState(initialLanguage);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const { changePassword } = await import('@/actions');
    const result = await changePassword(formData);
    setMessage(result.success ? 'Password changed successfully.' : 'Failed to change password.');
    setPasswordLoading(false);
  }

  async function handlePreferencesChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPrefsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.set('notificationEmailEnabled', String(emailEnabled));
    formData.set('notificationInAppEnabled', String(inAppEnabled));
    formData.set('theme', theme);
    formData.set('language', language);
    const { updateNotificationPreferences } = await import('@/actions');
    const result = await updateNotificationPreferences(formData);
    setMessage(result.success ? 'Preferences updated.' : 'Failed to update preferences.');
    setPrefsLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Settings</h1>

      {message && (
        <div className="rounded-lg bg-accent-blue-light p-3 text-sm text-accent-blue">{message}</div>
      )}

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-text-primary">Change Password</h2></CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="Current Password" name="currentPassword" type="password" required />
            <Input label="New Password" name="newPassword" type="password" required helperText="At least 8 characters with a letter and number" />
            <Button type="submit" loading={passwordLoading}>Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-text-primary">Notification Preferences</h2></CardHeader>
        <CardContent>
          <form onSubmit={handlePreferencesChange} className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border-default text-accent-blue"
              />
              <span className="text-sm text-text-primary">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={inAppEnabled}
                onChange={(e) => setInAppEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border-default text-accent-blue"
              />
              <span className="text-sm text-text-primary">In-app notifications</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-text-primary">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <Button type="submit" loading={prefsLoading}>Save Preferences</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
