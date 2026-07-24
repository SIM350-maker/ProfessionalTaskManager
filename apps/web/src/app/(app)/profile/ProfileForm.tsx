'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Palette, Bell, Monitor, Sun, Moon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';

interface ProfileFormProps {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  initialTheme: string;
  initialEmailEnabled: boolean;
  initialInAppEnabled: boolean;
}

export function ProfileForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialTheme,
  initialEmailEnabled,
  initialInAppEnabled,
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [theme, setTheme] = useState(initialTheme);
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [inAppEnabled, setInAppEnabled] = useState(initialInAppEnabled);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('firstName', firstName);
      formData.set('lastName', lastName);
      formData.set('email', email);

      const { updateUserProfile } = await import('@/actions');
      const result = await updateUserProfile(formData);

      if (result.success) {
        setMessageType('success');
        setMessage('Profile updated successfully.');
        router.refresh();
      } else {
        setMessageType('error');
        setMessage('Failed to update profile.');
      }
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
      formData.set('language', 'en');

      const { updateNotificationPreferences } = await import('@/actions');
      const result = await updateNotificationPreferences(formData);

      if (result.success) {
        setMessageType('success');
        setMessage('Preferences saved.');
        router.refresh();
      } else {
        setMessageType('error');
        setMessage('Failed to save preferences.');
      }
    } catch {
      setMessageType('error');
      setMessage('An unexpected error occurred.');
    }
    setLoading(false);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Profile</h1>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              messageType === 'success'
                ? 'bg-accent-green-light text-accent-green'
                : 'bg-accent-red-light text-accent-red'
            }`}
          >
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Personal Information</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  prefix={<User className="h-4 w-4" />}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  prefix={<User className="h-4 w-4" />}
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefix={<Mail className="h-4 w-4" />}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Theme Preference</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      theme === value
                        ? 'border-accent-blue bg-accent-blue-light text-accent-blue'
                        : 'border-border-default text-text-secondary hover:border-border-hover hover:bg-bg-hover'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  loading={loading}
                  icon={<Save className="h-4 w-4" />}
                  onClick={handlePreferencesSave}
                >
                  Save Theme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <p className="text-xs text-text-secondary">Receive notifications via email</p>
                </div>
                <span className={`text-xs font-medium ${emailEnabled ? 'text-accent-green' : 'text-text-tertiary'}`}>
                  {emailEnabled ? 'Enabled' : 'Disabled'}
                </span>
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
                  <p className="text-xs text-text-secondary">Receive notifications within the app</p>
                </div>
                <span className={`text-xs font-medium ${inAppEnabled ? 'text-accent-green' : 'text-text-tertiary'}`}>
                  {inAppEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  loading={loading}
                  icon={<Save className="h-4 w-4" />}
                  onClick={handlePreferencesSave}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
