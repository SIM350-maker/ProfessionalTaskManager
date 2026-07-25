'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';

interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onStatusChange: (status: string) => Promise<void>;
  onAssign: (userId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function BulkActionBar({ selectedCount, onClear, onStatusChange, onAssign, onDelete }: BulkActionBarProps) {
  const [status, setStatus] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (selectedCount === 0) return;
    fetch('/api/v1/users/assignable')
      .then((r) => r.json())
      .then((data) => setUsers(data.data ?? []))
      .catch(() => setUsers([]));
  }, [selectedCount]);

  if (selectedCount === 0) return null;

  async function handleStatusApply() {
    if (!status) return;
    setBusy(true);
    await onStatusChange(status);
    setStatus('');
    setBusy(false);
  }

  async function handleAssignApply() {
    if (!assigneeId) return;
    setBusy(true);
    await onAssign(assigneeId);
    setAssigneeId('');
    setBusy(false);
  }

  async function handleDeleteConfirm() {
    setBusy(true);
    await onDelete();
    setBusy(false);
    setDeleteOpen(false);
  }

  return (
    <div className="sticky bottom-4 z-30 mx-auto flex w-full max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-border-default bg-bg-card p-3 shadow-modal">
      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
        {selectedCount} selected
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1.5">
          <Select
            value={status}
            onChange={(val) => setStatus(val as string)}
            options={STATUS_OPTIONS}
            placeholder="Set status"
            className="w-36"
          />
          <Button size="sm" variant="outline" disabled={!status || busy} onClick={handleStatusApply}>Apply</Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Select
            value={assigneeId}
            onChange={(val) => setAssigneeId(val as string)}
            options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
            placeholder="Assign to"
            className="w-40"
          />
          <Button size="sm" variant="outline" disabled={!assigneeId || busy} onClick={handleAssignApply}>Apply</Button>
        </div>

        <Button size="sm" variant="destructive" icon={<Trash2 className="h-3.5 w-3.5" />} disabled={busy} onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete tasks">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Delete {selectedCount} selected task{selectedCount !== 1 ? 's' : ''}? This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" loading={busy} onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
