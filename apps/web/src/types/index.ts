import type {
  User,
  Organization,
  Team,
  Project,
  Task,
  Comment,
  Attachment,
  Notification,
  ActivityLog,
  Role,
  Permission,
  UserTeam,
  ProjectMember,
  TaskAssignee,
  RolePermission,
  Label,
  TaskLabel,
  TimeEntry,
  TaskDependency,
  UserPreferences,
  CustomFieldDefinition,
  Workflow,
  WorkflowState,
  WorkflowTransition,
  AutomationRule,
  TaskTemplate,
  AutomationTrigger,
  AutomationActionType,
} from '@generated/prisma/client';

export type {
  User,
  Organization,
  Team,
  Project,
  Task,
  Comment,
  Attachment,
  Notification,
  ActivityLog,
  Role,
  Permission,
  UserTeam,
  ProjectMember,
  TaskAssignee,
  RolePermission,
  Label,
  TaskLabel,
  TimeEntry,
  TaskDependency,
  UserPreferences,
  CustomFieldDefinition,
  Workflow,
  WorkflowState,
  WorkflowTransition,
  AutomationRule,
  TaskTemplate,
  AutomationTrigger,
  AutomationActionType,
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type ProjectVisibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';
export type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'TEAM_MEMBER';
export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'USER' | 'BOOLEAN';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  cursor?: string;
  hasNextPage?: boolean;
  page?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: { field: string; message: string }[];
  };
  traceId: string;
}

export type TaskWithRelations = Task & {
  assignees: (TaskAssignee & { user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> })[];
  labels: (TaskLabel & { label: Label })[];
  creator: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  project: Pick<Project, 'id' | 'name'>;
};

export type ProjectWithRelations = Project & {
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  members: (ProjectMember & {
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'email'>;
    role: Role;
  })[];
  _count?: { tasks: number };
};

export type CommentWithRelations = Comment & {
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  replies?: CommentWithRelations[];
};

export type NotificationWithActor = Notification & {
  actor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> | null;
};

export type UserWithRoles = User & {
  teams?: (UserTeam & { team: Team })[];
  roles?: Role[];
};

export interface WorkflowWithStates extends Workflow {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowWithStates extends Workflow {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface CustomFieldWithDefinition extends CustomFieldDefinition {
  value?: unknown;
}

export const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'] as const;
export const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const PROJECT_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const;
export const PROJECT_VISIBILITY_VALUES = ['PRIVATE', 'INTERNAL', 'PUBLIC'] as const;
export const CUSTOM_FIELD_TYPE_VALUES = ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'USER', 'BOOLEAN'] as const;
