import { prisma } from '@/lib/database';
import type { TaskTemplate, TaskStatus, Priority } from '@/types';

export async function getTaskTemplatesByOrg(organizationId: string): Promise<TaskTemplate[]> {
  return prisma.taskTemplate.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export async function getTaskTemplateById(id: string): Promise<TaskTemplate | null> {
  return prisma.taskTemplate.findUnique({
    where: { id },
  });
}

export async function createTaskTemplate(data: {
  organizationId: string;
  name: string;
  description?: string;
  defaultStatus?: TaskStatus;
  defaultPriority?: Priority;
  estimatedHours?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  fields?: Record<string, unknown>;
  createdBy: string;
}): Promise<TaskTemplate> {
  return prisma.taskTemplate.create({
    data: {
      ...data,
      fields: (data.fields ?? {}) as object,
    },
  });
}

export async function updateTaskTemplate(id: string, data: {
  name?: string;
  description?: string;
  defaultStatus?: TaskStatus;
  defaultPriority?: Priority;
  estimatedHours?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  fields?: Record<string, unknown>;
}): Promise<TaskTemplate> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.defaultStatus !== undefined) updateData.defaultStatus = data.defaultStatus;
  if (data.defaultPriority !== undefined) updateData.defaultPriority = data.defaultPriority;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
  if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
  if (data.recurrenceRule !== undefined) updateData.recurrenceRule = data.recurrenceRule;
  if (data.fields !== undefined) updateData.fields = data.fields as object;

  return prisma.taskTemplate.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteTaskTemplate(id: string): Promise<void> {
  await prisma.taskTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function createRecurringTaskInstance(
  templateId: string,
  taskId: string,
  scheduledAt: Date,
): Promise<void> {
  await prisma.recurringTaskInstance.create({
    data: {
      templateId,
      taskId,
      scheduledAt,
    },
  });
}

export async function getDueRecurringTasks(): Promise<Array<{ template: TaskTemplate; instance: { id: string; taskId: string; scheduledAt: Date } }>> {
  const now = new Date();
  const instances = await prisma.recurringTaskInstance.findMany({
    where: {
      completedAt: null,
      scheduledAt: { lte: now },
    },
    include: {
      template: true,
    },
  });

  return instances.map((instance) => ({
    template: instance.template,
    instance: {
      id: instance.id,
      taskId: instance.taskId,
      scheduledAt: instance.scheduledAt,
    },
  }));
}
