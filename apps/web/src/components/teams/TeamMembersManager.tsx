'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { getActionErrorMessage } from '@/lib/helpers';

interface TeamMember {
  userId: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null; email: string };
}

interface AvailableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TeamMembersManagerProps {
  teamId: string;
  members: TeamMember[];
  availableUsers: AvailableUser[];
}

export function TeamMembersManager({ teamId, members, availableUsers }: TeamMembersManagerProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleAddMember() {
    if (!selectedUserId) return;
    setLoading(true);
    setError('');
    const { addTeamMember } = await import('@/actions');
    const result = await addTeamMember(teamId, selectedUserId);
    setLoading(false);
    if (result.success) {
      setAddOpen(false);
      setSelectedUserId('');
      router.refresh();
    } else {
      setError(getActionErrorMessage(result.error));
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingId(userId);
    const { removeTeamMember } = await import('@/actions');
    await removeTeamMember(teamId, userId);
    setRemovingId(null);
    router.refresh();
  }

  async function handleDeleteTeam() {
    setLoading(true);
    const { deleteTeam } = await import('@/actions');
    const result = await deleteTeam(teamId);
    if (result.success) {
      router.push('/teams');
    } else {
      setError(getActionErrorMessage(result.error));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Link href={`/teams/${teamId}/edit`}>
          <Button variant="outline" size="sm" icon={<Pencil className="h-3.5 w-3.5" />}>Edit Team</Button>
        </Link>
        <Button variant="destructive" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDeleteOpen(true)}>
          Delete Team
        </Button>
      </div>

      <div className="divide-y">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar {...member.user} size="sm" />
              <div>
                <p className="text-sm font-medium text-text-primary">{member.user.firstName} {member.user.lastName}</p>
                <p className="text-xs text-text-secondary">{member.user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveMember(member.userId)}
              disabled={removingId === member.userId}
              className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-accent-red-light hover:text-accent-red disabled:opacity-50"
              aria-label={`Remove ${member.user.firstName} ${member.user.lastName}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => setAddOpen(true)}>
        Add Member
      </Button>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Team Member">
        <div className="space-y-4">
          {error && <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>}
          {availableUsers.length === 0 ? (
            <p className="text-sm text-text-secondary">All organization members are already on this team.</p>
          ) : (
            <Select
              label="User"
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val as string)}
              options={availableUsers.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` }))}
              placeholder="Select a user"
            />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} loading={loading} disabled={!selectedUserId}>Add</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Team">
        <div className="space-y-4">
          {error && <div className="rounded-lg bg-accent-red-light p-3 text-sm text-accent-red">{error}</div>}
          <p className="text-sm text-text-secondary">
            This will permanently delete this team. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTeam} loading={loading}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
