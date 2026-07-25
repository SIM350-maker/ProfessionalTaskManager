'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Shield, Users, UserCheck, UserX } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, maskEmail } from '@/lib/helpers';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
}

const roleBadgeVariant: Record<string, 'primary' | 'warning' | 'default'> = {
  ADMINISTRATOR: 'primary',
  MANAGER: 'warning',
  TEAM_MEMBER: 'default',
};

const roleIcon: Record<string, typeof Shield> = {
  ADMINISTRATOR: Shield,
  MANAGER: Users,
  TEAM_MEMBER: UserCheck,
};

interface UsersTableProps {
  users: UserRow[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  async function handleDeactivate(userId: string) {
    setDeactivatingId(userId);
    const { deactivateUser } = await import('@/actions');
    await deactivateUser(userId);
    setDeactivatingId(null);
    router.refresh();
  }

  const columns: ColumnDef<UserRow, unknown>[] = [
    {
      accessorKey: 'firstName',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={u.firstName} lastName={u.lastName} avatarUrl={u.avatarUrl} size="sm" status={u.isActive ? 'online' : 'offline'} />
            <div>
              <span className="font-medium text-text-primary">{u.firstName} {u.lastName}</span>
              {u.id === currentUserId && <span className="ml-2 text-xs text-text-tertiary">(you)</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-text-secondary" title={row.original.email}>{maskEmail(row.original.email)}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const RoleIcon = roleIcon[row.original.role] || Shield;
        return (
          <Badge variant={roleBadgeVariant[row.original.role] || 'default'}>
            <RoleIcon className="mr-1 inline h-3 w-3" />
            {row.original.role.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'bg-accent-green-light text-accent-green' : 'bg-accent-red-light text-accent-red'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-accent-green' : 'bg-accent-red'}`} />
            {active ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : 'Never'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        if (!u.isActive || u.id === currentUserId) return null;
        return (
          <button
            type="button"
            onClick={() => handleDeactivate(u.id)}
            disabled={deactivatingId === u.id}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-red transition-colors hover:text-accent-red-hover disabled:opacity-50"
          >
            <UserX className="h-3.5 w-3.5" />
            Deactivate
          </button>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={users} getRowId={(u) => u.id} emptyMessage="No users found." />;
}
