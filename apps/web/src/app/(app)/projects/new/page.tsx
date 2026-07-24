'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

const statusOptions = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

const visibilityOptions = [
  { value: 'PRIVATE', label: 'Private' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'PUBLIC', label: 'Public' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user && user.role === 'TEAM_MEMBER') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role === 'TEAM_MEMBER') return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { createProject } = await import('@/actions');
    const result = await createProject(formData);

    if (result.success && result.data) {
      router.push(`/projects/${result.data.id}`);
    } else {
      setError('Failed to create project');
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Create Project</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>
            )}
            <Input label="Project Name" name="name" required />
            <div>
              <label className="block text-sm font-medium text-text-primary">Description</label>
              <textarea
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary shadow-card focus:border-border-active focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
              />
            </div>
            <Select label="Status" name="status" options={statusOptions} placeholder="Select status" />
            <Select label="Visibility" name="visibility" options={visibilityOptions} placeholder="Select visibility" />
            <Input label="Color" name="color" type="color" helperText="Hex color for project identification" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" name="startDate" type="datetime-local" />
              <Input label="End Date" name="endDate" type="datetime-local" />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Project</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
