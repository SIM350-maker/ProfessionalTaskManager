import { z } from 'zod';

export const emailSchema = z.string().email({ message: 'Invalid email format' }).max(255);

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, { message: 'Password must contain at least one letter and one number' });

export const nameSchema = z.string().min(1, { message: 'Required' }).max(100);

export const taskTitleSchema = z.string().min(1, { message: 'Title is required' }).max(200);

export const taskDescriptionSchema = z.string().max(5000).optional();

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED']).optional();

export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional();

export const isoDateSchema = z.string().datetime({ message: 'Invalid ISO 8601 date' }).optional();

export const projectNameSchema = z.string().min(1, { message: 'Project name is required' }).max(200);

export const projectDescriptionSchema = z.string().max(5000).optional();

export const projectStatusSchema = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional();

export const projectVisibilitySchema = z.enum(['PRIVATE', 'INTERNAL', 'PUBLIC']).optional();

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Invalid hex color' }).optional();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  mode: z.enum(['PERSONAL', 'ORGANIZATION']),
  organizationName: z.string().min(1).max(200).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  projectId: z.string().min(1, { message: 'Project is required' }),
  workflowId: z.string().optional(),
  status: taskStatusSchema,
  priority: prioritySchema,
  dueDate: isoDateSchema,
  startDate: isoDateSchema,
  estimatedHours: z.number().min(0).optional(),
  parentTaskId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  status: projectStatusSchema,
  visibility: projectVisibilitySchema,
  color: hexColorSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  leadId: z.string().uuid().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createCommentSchema = z.object({
  message: z.string().min(1, { message: 'Comment is required' }).max(2000),
  parentCommentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  message: z.string().min(1, { message: 'Comment is required' }).max(2000),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, { message: 'Team name is required' }).max(200),
  description: z.string().max(1000).optional(),
  memberIds: z.array(z.string()).optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  jobTitle: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createTimeEntrySchema = z.object({
  taskId: z.string().min(1, { message: 'Task is required' }),
  startTime: z.string().datetime({ message: 'Invalid start time' }),
  endTime: z.string().datetime({ message: 'Invalid end time' }).optional(),
  description: z.string().max(1000).optional(),
});

export const createLabelSchema = z.object({
  name: z.string().min(1, { message: 'Label name is required' }).max(50),
  color: hexColorSchema,
});

export const createAttachmentSchema = z.object({
  filename: z.string().min(1, { message: 'Filename is required' }),
  originalName: z.string().min(1, { message: 'Original filename is required' }),
  mimeType: z.string().min(1, { message: 'MIME type is required' }),
  size: z.number().positive({ message: 'Size must be positive' }),
  url: z.string().min(1, { message: 'URL is required' }),
  taskId: z.string().min(1, { message: 'Task is required' }),
  commentId: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  notificationEmailEnabled: z.boolean().optional(),
  notificationInAppEnabled: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
});

export const customFieldTypeSchema = z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'USER', 'BOOLEAN']);

export const createCustomFieldSchema = z.object({
  name: z.string().min(1, { message: 'Field name is required' }).max(100),
  key: z.string().min(1, { message: 'Field key is required' }).max(50).regex(/^[a-z0-9_]+$/, { message: 'Key must be lowercase alphanumeric with underscores' }),
  type: customFieldTypeSchema,
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  entityType: z.enum(['TASK', 'PROJECT', 'USER']).default('TASK'),
  projectId: z.string().optional(),
  order: z.number().min(0).optional(),
});

export const updateCustomFieldSchema = createCustomFieldSchema.partial();

export const createWorkflowSchema = z.object({
  name: z.string().min(1, { message: 'Workflow name is required' }).max(100),
  entityType: z.enum(['TASK', 'PROJECT', 'USER']).default('TASK'),
  isDefault: z.boolean().optional(),
  states: z.array(
    z.object({
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Invalid hex color' }),
      isInitial: z.boolean().optional(),
      isFinal: z.boolean().optional(),
      orderIndex: z.number().min(0),
    })
  ).min(1, { message: 'At least one state is required' }),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createWorkflowStateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Invalid hex color' }),
  isInitial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  orderIndex: z.number().min(0),
});

export const createWorkflowTransitionSchema = z.object({
  fromStateId: z.string().min(1),
  toStateId: z.string().min(1),
  condition: z.record(z.unknown()).optional(),
});

export const automationTriggerSchema = z.enum([
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_STATUS_CHANGED',
  'TASK_OVERDUE',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'COMMENT_ADDED',
  'PROJECT_CREATED',
]);

export const automationActionTypeSchema = z.enum([
  'SET_STATUS',
  'SET_PRIORITY',
  'ASSIGN_USER',
  'ADD_LABEL',
  'SEND_NOTIFICATION',
  'CREATE_TASK',
  'UPDATE_FIELD',
]);

export const createAutomationRuleSchema = z.object({
  name: z.string().min(1, { message: 'Rule name is required' }).max(100),
  description: z.string().max(500).optional(),
  trigger: automationTriggerSchema,
  conditions: z.record(z.unknown()).default({}),
  actions: z.array(z.record(z.unknown())).min(1, { message: 'At least one action is required' }),
  isActive: z.boolean().default(true),
});

export const updateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  trigger: automationTriggerSchema.optional(),
  conditions: z.record(z.unknown()).optional(),
  actions: z.array(z.record(z.unknown())).optional(),
  isActive: z.boolean().optional(),
});

export const createTaskTemplateSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required' }).max(100),
  description: z.string().max(500).optional(),
  defaultStatus: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED']).default('TODO'),
  defaultPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedHours: z.number().min(0).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  fields: z.record(z.unknown()).default({}),
});

export const updateTaskTemplateSchema = createTaskTemplateSchema.partial();

