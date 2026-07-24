import { prisma } from '@/lib/database';
import type { Workflow, WorkflowState, WorkflowTransition, CustomFieldType } from '@/types';

export async function getWorkflowsByOrg(organizationId: string, entityType = 'TASK'): Promise<(Workflow & { states: WorkflowState[] })[]> {
  return prisma.workflow.findMany({
    where: { organizationId, entityType, isActive: true, deletedAt: null },
    include: { states: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { name: 'asc' },
  });
}

export async function getDefaultWorkflow(organizationId: string, entityType = 'TASK'): Promise<(Workflow & { states: WorkflowState[] }) | null> {
  return prisma.workflow.findFirst({
    where: { organizationId, entityType, isDefault: true, isActive: true, deletedAt: null },
    include: { states: { orderBy: { orderIndex: 'asc' } } },
  });
}

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  return prisma.workflow.findUnique({
    where: { id },
    include: {
      states: { orderBy: { orderIndex: 'asc' } },
      tasks: { select: { id: true, title: true, status: true } },
    },
  });
}

export async function createWorkflow(data: {
  organizationId: string;
  name: string;
  entityType: string;
  isDefault?: boolean;
  states: Array<{
    name: string;
    color: string;
    isInitial?: boolean;
    isFinal?: boolean;
    orderIndex: number;
  }>;
}): Promise<Workflow> {
  const { states, ...workflowData } = data;

  const workflow = await prisma.workflow.create({
    data: {
      ...workflowData,
      isDefault: data.isDefault ?? false,
      states: {
        create: states.map((s) => ({
          name: s.name,
          color: s.color,
          isInitial: s.isInitial ?? false,
          isFinal: s.isFinal ?? false,
          orderIndex: s.orderIndex,
        })),
      },
    },
    include: { states: true },
  });

  return workflow;
}

export async function updateWorkflow(id: string, data: {
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
}): Promise<Workflow> {
  return prisma.workflow.update({
    where: { id },
    data,
    include: { states: { orderBy: { orderIndex: 'asc' } } },
  });
}

export async function deleteWorkflow(id: string): Promise<void> {
  await prisma.workflow.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function addWorkflowState(workflowId: string, data: {
  name: string;
  color: string;
  isInitial?: boolean;
  isFinal?: boolean;
  orderIndex: number;
}): Promise<WorkflowState> {
  return prisma.workflowState.create({
    data: {
      workflowId,
      ...data,
      isInitial: data.isInitial ?? false,
      isFinal: data.isFinal ?? false,
    },
  });
}

export async function updateWorkflowState(id: string, data: {
  name?: string;
  color?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  orderIndex?: number;
}): Promise<WorkflowState> {
  return prisma.workflowState.update({
    where: { id },
    data,
  });
}

export async function deleteWorkflowState(id: string): Promise<void> {
  await prisma.workflowState.delete({
    where: { id },
  });
}

export async function addWorkflowTransition(fromStateId: string, toStateId: string, condition = {}): Promise<WorkflowTransition> {
  return prisma.workflowTransition.create({
    data: {
      fromStateId,
      toStateId,
      condition,
    },
  });
}

export async function deleteWorkflowTransition(id: string): Promise<void> {
  await prisma.workflowTransition.delete({
    where: { id },
  });
}

export async function getTransitionsForState(stateId: string): Promise<WorkflowTransition[]> {
  return prisma.workflowTransition.findMany({
    where: { fromStateId: stateId },
    include: { toState: true },
  });
}
