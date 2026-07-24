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
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initial, setInitial] = useState<{ title: string; description: string | null; status: string; priority: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'TEAM_MEMBER') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch(`/api/v1/tasks/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setInitial({
            title: data.data.title,
            description: data.data.description,
            status: data.data.status,
            priority: data.data.priority,
          });
        }
      })
      .catch(() => setError('Failed to load task'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { updateTask } = await import('@/actions');
    const result = await updateTask(id, formData);

    if (result.success) {
      router.push(`/tasks/${id}`);
    } else {
      setError('Failed to update task');
    }
    setLoading(false);
  }

  if (!initial) {
    return <div className="text-center text-text-tertiary py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Edit Task</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>}
            <Input label="Title" name="title" required defaultValue={initial.title} />
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
            <Select label="Priority" name="priority" options={priorityOptions} defaultValue={initial.priority} />
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
