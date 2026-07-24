'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
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

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initial, setInitial] = useState<{
    name: string;
    description: string | null;
    status: string;
    visibility: string;
    color: string | null;
    startDate: string | null;
    endDate: string | null;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'TEAM_MEMBER') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch(`/api/v1/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          const p = data.data;
          setInitial({
            name: p.name,
            description: p.description,
            status: p.status,
            visibility: p.visibility,
            color: p.color,
            startDate: p.startDate,
            endDate: p.endDate,
          });
        }
      })
      .catch(() => setError('Failed to load project'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { updateProject } = await import('@/actions');
    const result = await updateProject(id, formData);

    if (result.success) {
      router.push(`/projects/${id}`);
    } else {
      setError('Failed to update project');
    }
    setLoading(false);
  }

  if (!initial) {
    return <div className="text-center text-text-tertiary py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Edit Project</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>
            )}
            <Input label="Project Name" name="name" required defaultValue={initial.name} />
            <div>
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={initial.description ?? ''}
                className="mt-1 block w-full rounded-lg border border-border-default px-3 py-2 text-sm shadow-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <Select label="Status" name="status" options={statusOptions} defaultValue={initial.status} />
            <Select label="Visibility" name="visibility" options={visibilityOptions} defaultValue={initial.visibility} />
            <Input label="Color" name="color" type="color" defaultValue={initial.color ?? '#6b7280'} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
