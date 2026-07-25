import { prisma } from '@/lib/database';
import type { AutomationRule, AutomationTrigger, AutomationActionType } from '@/types';

export async function getAutomationRulesByOrg(organizationId: string): Promise<AutomationRule[]> {
  return prisma.automationRule.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAutomationRuleById(id: string): Promise<AutomationRule | null> {
  return prisma.automationRule.findUnique({
    where: { id },
  });
}

export async function createAutomationRule(data: {
  organizationId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  createdBy: string;
}): Promise<AutomationRule> {
  return prisma.automationRule.create({
    data: {
      ...data,
      conditions: data.conditions as object,
      actions: data.actions as object[],
    },
  });
}

export async function updateAutomationRule(id: string, data: {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: Record<string, unknown>;
  actions?: Array<Record<string, unknown>>;
  isActive?: boolean;
}): Promise<AutomationRule> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.trigger !== undefined) updateData.trigger = data.trigger;
  if (data.conditions !== undefined) updateData.conditions = data.conditions as object;
  if (data.actions !== undefined) updateData.actions = data.actions as object[];
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.automationRule.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteAutomationRule(id: string): Promise<void> {
  await prisma.automationRule.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function evaluateAutomationRules(
  organizationId: string,
  trigger: AutomationTrigger,
  context: Record<string, unknown>,
): Promise<void> {
  const rules = await prisma.automationRule.findMany({
    where: {
      organizationId,
      trigger,
      isActive: true,
      deletedAt: null,
    },
  });

  for (const rule of rules) {
    if (matchesConditions(rule.conditions as Record<string, unknown>, context)) {
      await executeActions(rule.actions as Array<Record<string, unknown>>, context);
    }
  }
}

function matchesConditions(conditions: Record<string, unknown>, context: Record<string, unknown>): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  for (const [key, expected] of Object.entries(conditions)) {
    const actual = getNestedValue(context, key);
    if (actual !== expected) return false;
  }

  return true;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

async function getTaskOrgId(taskId: string): Promise<string | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { organizationId: true } } },
  });
  return task?.project?.organizationId ?? null;
}

async function executeActions(actions: Array<Record<string, unknown>>, context: Record<string, unknown>): Promise<void> {
  for (const action of actions) {
    const type = action.type as AutomationActionType;

    switch (type) {
      case 'SET_STATUS':
        await setTaskStatus(context.taskId as string, action.value as string);
        break;
      case 'SET_PRIORITY':
        await setTaskPriority(context.taskId as string, action.value as string);
        break;
      case 'ASSIGN_USER':
        await assignTaskUser(context.taskId as string, action.userId as string);
        break;
      case 'ADD_LABEL':
        await addTaskLabel(context.taskId as string, action.labelId as string);
        break;
      case 'SEND_NOTIFICATION':
        await sendNotification(context, action);
        break;
      case 'CREATE_TASK':
        await createTaskFromAction(action, context);
        break;
      case 'UPDATE_FIELD':
        await updateCustomField(context.taskId as string, action.fieldKey as string, action.value);
        break;
    }
  }
}

async function setTaskStatus(taskId: string, status: string): Promise<void> {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED',
      updatedAt: new Date(),
    },
  });
}

async function setTaskPriority(taskId: string, priority: string): Promise<void> {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      updatedAt: new Date(),
    },
  });
}

async function assignTaskUser(taskId: string, userId: string): Promise<void> {
  const orgId = await getTaskOrgId(taskId);
  if (!orgId) return;

  await prisma.taskAssignee.upsert({
    where: { userId_taskId: { userId, taskId } },
    update: {},
    create: {
      userId,
      taskId,
      assignedBy: userId,
      organizationId: orgId,
    },
  });
}

async function addTaskLabel(taskId: string, labelId: string): Promise<void> {
  const orgId = await getTaskOrgId(taskId);
  if (!orgId) return;

  await prisma.taskLabel.upsert({
    where: { taskId_labelId: { taskId, labelId } },
    update: {},
    create: { taskId, labelId, organizationId: orgId },
  });
}

async function sendNotification(context: Record<string, unknown>, action: Record<string, unknown>): Promise<void> {
  const { createNotification } = await import('@/services/notifications');
  const { sendSlackNotification } = await import('@/services/integrations/slack');
  const notificationType = (action.type as string) === 'SEND_NOTIFICATION' ? 'TASK_ASSIGNED' : 'TASK_ASSIGNED';
  const title = (action.title as string) || 'Automated Notification';
  const message = (action.message as string) || '';

  await createNotification({
    type: notificationType,
    title,
    message,
    entityType: (action.entityType as string) || 'task',
    entityId: (context.taskId as string) || '',
    userId: (action.userId as string) || (context.assigneeId as string) || '',
  });

  if (context.taskId) {
    const orgId = await getTaskOrgId(context.taskId as string);
    if (orgId) {
      await sendSlackNotification(orgId, `:robot_face: *${title}*${message ? `\n${message}` : ''}`);
    }
  }
}

async function createTaskFromAction(action: Record<string, unknown>, context: Record<string, unknown>): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: context.taskId as string },
    include: { project: { select: { organizationId: true, id: true } } },
  });

  if (!task) return;

  await prisma.task.create({
    data: {
      title: (action.title as string) || 'New Task',
      description: (action.description as string) || '',
      projectId: task.project.id,
      createdBy: (context.userId as string) || '',
      status: 'TODO',
      priority: 'MEDIUM',
    },
  });
}

async function updateCustomField(taskId: string, fieldKey: string, value: unknown): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { customFields: true },
  });

  if (!task) return;

  const customFields = (task.customFields as Record<string, unknown>) || {};
  customFields[fieldKey] = value;

  await prisma.task.update({
    where: { id: taskId },
    data: { customFields: customFields as object },
  });
}

export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  TASK_CREATED: 'Task Created',
  TASK_UPDATED: 'Task Updated',
  TASK_STATUS_CHANGED: 'Task Status Changed',
  TASK_OVERDUE: 'Task Overdue',
  TASK_ASSIGNED: 'Task Assigned',
  TASK_COMPLETED: 'Task Completed',
  COMMENT_ADDED: 'Comment Added',
  PROJECT_CREATED: 'Project Created',
};

export const ACTION_LABELS: Record<AutomationActionType, string> = {
  SET_STATUS: 'Set Status',
  SET_PRIORITY: 'Set Priority',
  ASSIGN_USER: 'Assign User',
  ADD_LABEL: 'Add Label',
  SEND_NOTIFICATION: 'Send Notification',
  CREATE_TASK: 'Create Task',
  UPDATE_FIELD: 'Update Custom Field',
};
