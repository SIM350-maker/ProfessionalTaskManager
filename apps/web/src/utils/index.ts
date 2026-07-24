import { STATUS_LABELS, PRIORITY_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import type { TaskStatus, Priority, ProjectStatus, UserRole } from '@/types';

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMINISTRATOR: 'Administrator',
    MANAGER: 'Manager',
    TEAM_MEMBER: 'Team Member',
  };
  return labels[role] ?? role;
}
