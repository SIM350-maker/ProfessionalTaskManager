'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function NewTeamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMINISTRATOR') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'ADMINISTRATOR') return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const { createTeam } = await import('@/actions');
    const result = await createTeam(formData);

    if (result.success) {
      router.push('/teams');
    } else {
      setError('Failed to create team');
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Create Team</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>
            )}
            <Input label="Team Name" name="name" required placeholder="Enter team name" />
            <div>
              <label className="block text-sm font-medium text-text-primary">Description</label>
              <textarea
                name="description"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-border-default bg-bg-card px-3 py-2 text-sm text-text-primary shadow-card focus:border-border-active focus:outline-none focus:ring-1 focus:ring-accent-blue/20"
                placeholder="Describe the team's purpose..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={loading}>Create Team</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
