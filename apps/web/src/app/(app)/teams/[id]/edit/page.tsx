'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { getActionErrorMessage } from '@/lib/helpers';

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initial, setInitial] = useState<{ name: string; description: string | null } | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMINISTRATOR' && user.role !== 'MANAGER') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch(`/api/v1/teams/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setInitial({ name: data.data.name, description: data.data.description });
        }
      })
      .catch(() => setError('Failed to load team'));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { updateTeam } = await import('@/actions');
    const result = await updateTeam(id, formData);

    if (result.success) {
      router.push(`/teams/${id}`);
    } else {
      setError(getActionErrorMessage(result.error));
    }
    setLoading(false);
  }

  if (!initial) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-text-primary">Edit Team</h1>
        <FormSkeleton fields={2} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Edit Team</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>}
            <Input label="Team Name" name="name" required defaultValue={initial.name} />
            <div>
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={initial.description ?? ''}
                className="mt-1 block w-full rounded-lg border border-border-default px-3 py-2 text-sm shadow-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
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
