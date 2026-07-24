import { prisma } from '@/lib/database';
import type { CustomFieldDefinition, CustomFieldType } from '@/types';

export async function getCustomFieldsByOrg(organizationId: string, entityType = 'TASK', projectId?: string): Promise<CustomFieldDefinition[]> {
  return prisma.customFieldDefinition.findMany({
    where: {
      organizationId,
      entityType,
      isActive: true,
      deletedAt: null,
      ...(projectId ? { projectId } : { projectId: null }),
    },
    orderBy: { order: 'asc' },
  });
}

export async function getCustomFieldById(id: string): Promise<CustomFieldDefinition | null> {
  return prisma.customFieldDefinition.findUnique({
    where: { id },
  });
}

export async function createCustomField(data: {
  organizationId: string;
  name: string;
  key: string;
  type: CustomFieldType;
  options?: string[];
  isRequired?: boolean;
  entityType?: string;
  projectId?: string;
  order?: number;
}): Promise<CustomFieldDefinition> {
  return prisma.customFieldDefinition.create({
    data: {
      ...data,
      options: data.options ?? [],
      isRequired: data.isRequired ?? false,
      entityType: data.entityType ?? 'TASK',
      order: data.order ?? 0,
    },
  });
}

export async function updateCustomField(id: string, data: {
  name?: string;
  key?: string;
  type?: CustomFieldType;
  options?: string[];
  isRequired?: boolean;
  isActive?: boolean;
  order?: number;
}): Promise<CustomFieldDefinition> {
  return prisma.customFieldDefinition.update({
    where: { id },
    data,
  });
}

export async function deleteCustomField(id: string): Promise<void> {
  await prisma.customFieldDefinition.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCustomFieldsForProject(projectId: string): Promise<CustomFieldDefinition[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });

  if (!project) return [];

  return prisma.customFieldDefinition.findMany({
    where: {
      organizationId: project.organizationId,
      entityType: 'TASK',
      isActive: true,
      deletedAt: null,
      OR: [{ projectId: null }, { projectId }],
    },
    orderBy: { order: 'asc' },
  });
}

export function validateCustomFieldValue(field: CustomFieldDefinition, value: unknown): { valid: boolean; error?: string } {
  if (field.isRequired && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.name} is required` };
  }

  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }

  switch (field.type) {
    case 'TEXT':
      if (typeof value !== 'string') return { valid: false, error: `${field.name} must be a string` };
      return { valid: true };
    case 'NUMBER':
      if (typeof value !== 'number' || isNaN(value)) return { valid: false, error: `${field.name} must be a number` };
      return { valid: true };
    case 'DATE':
      if (isNaN(Date.parse(value as string))) return { valid: false, error: `${field.name} must be a valid date` };
      return { valid: true };
    case 'SELECT':
      if (Array.isArray(field.options) && !(field.options as unknown[]).includes(value as string)) {
        return { valid: false, error: `${field.name} must be one of: ${(field.options as string[]).join(', ')}` };
      }
      return { valid: true };
    case 'MULTI_SELECT':
      if (!Array.isArray(value)) return { valid: false, error: `${field.name} must be an array` };
      if (Array.isArray(field.options)) {
        const opts = field.options as string[];
        const invalid = (value as string[]).filter((v) => !opts.includes(v));
        if (invalid.length > 0) return { valid: false, error: `Invalid values for ${field.name}: ${invalid.join(', ')}` };
      }
      return { valid: true };
    case 'BOOLEAN':
      if (typeof value !== 'boolean') return { valid: false, error: `${field.name} must be a boolean` };
      return { valid: true };
    default:
      return { valid: true };
  }
}
