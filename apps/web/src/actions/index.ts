'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database';
import type { Prisma } from '@generated/prisma/client';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { createSession, deleteSession, deleteUserSessions } from '@/lib/session';
import {
  createTaskSchema,
  updateTaskSchema,
  createProjectSchema,
  updateProjectSchema,
  createCommentSchema,
  updateCommentSchema,
  createTeamSchema,
  updateTeamSchema,
  updateUserSchema,
  changePasswordSchema,
  registerSchema,
  loginSchema,
  passwordSchema,
} from '@/lib/validation';
import { z } from 'zod';
import { sanitizeUserGeneratedContent, getClientIp } from '@/lib/security';
import { checkAuthRateLimit } from '@/lib/security/rate-limiter';
import { notifyTaskCompleted } from '@/services/notifications';
import { evaluateAutomationRules } from '@/services/automation';
import { sendEmail, buildPasswordResetEmail, buildEmailVerificationEmail } from '@/services/email';
import { ensureSystemRolesForOrg } from '@/services/roles';
import { env } from '@/lib/config/env';

/**
 * The real login/register/reset-password pages call these server actions directly,
 * bypassing the rate limiting that exists on the (unused) /api/v1/auth route. This
 * enforces the same 5-requests/15-minute window at the point the UI actually calls in.
 */
async function enforceAuthRateLimit(action: string): Promise<boolean> {
  const ip = await getClientIp();
  const { allowed } = await checkAuthRateLimit(ip, action);
  return allowed;
}

const RATE_LIMIT_ERROR = { success: false as const, error: { message: 'Too many attempts. Please try again later.' } };

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export async function registerUser(formData: FormData) {
  if (!(await enforceAuthRateLimit('register'))) return RATE_LIMIT_ERROR;

  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { email, password, firstName, lastName, mode, organizationName } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: { message: 'Email already registered' } };
  }

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerificationToken = crypto.randomUUID();

  if (mode === 'PERSONAL') {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        isPersonalMode: true,
        emailVerificationToken,
        role: 'TEAM_MEMBER',
      },
    });

    const personalProject = await prisma.project.create({
      data: {
        name: 'Personal Tasks',
        description: 'Your personal task workspace',
        isPersonal: true,
        visibility: 'PRIVATE',
        ownerId: user.id,
        createdBy: user.id,
        organizationId: null,
      },
    });

    const defaultTemplates: Array<{
      name: string;
      description: string;
      defaultStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
      defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      estimatedHours: number;
      fields: Record<string, unknown>;
    }> = [
      { name: 'Daily Standup', description: 'Daily team standup meeting', defaultStatus: 'TODO', defaultPriority: 'MEDIUM', estimatedHours: 0.5, fields: {} },
      { name: 'Weekly Review', description: 'Weekly progress review', defaultStatus: 'TODO', defaultPriority: 'MEDIUM', estimatedHours: 1, fields: {} },
      { name: 'Bug Fix', description: 'Fix a reported bug', defaultStatus: 'TODO', defaultPriority: 'HIGH', estimatedHours: 2, fields: {} },
      { name: 'Feature Implementation', description: 'Implement a new feature', defaultStatus: 'TODO', defaultPriority: 'MEDIUM', estimatedHours: 4, fields: {} },
      { name: 'Documentation', description: 'Write or update documentation', defaultStatus: 'TODO', defaultPriority: 'LOW', estimatedHours: 1, fields: {} },
    ];

    await prisma.taskTemplate.createMany({
      data: defaultTemplates.map((tpl) => ({
        ...tpl,
        organizationId: null,
        createdBy: user.id,
        fields: {} as Prisma.InputJsonValue,
      })),
    });

    const session = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set('session_token', session.token, {
      ...COOKIE_OPTIONS,
      expires: session.expiresAt,
    });

    return { success: true, data: { userId: user.id, organizationId: null, isPersonalMode: true, projectId: personalProject.id } };
  }

  const existingOrg = await prisma.organization.findFirst({ where: { name: organizationName! } });
  const isNewOrg = !existingOrg;

  const organization = existingOrg ?? await prisma.organization.create({
    data: {
      name: organizationName!,
      slug: organizationName!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    },
  });

  const roles = await ensureSystemRolesForOrg(organization.id);
  const assignedRole = isNewOrg ? roles.admin : roles.member;

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      organizationId: organization.id,
      emailVerificationToken,
      role: isNewOrg ? 'ADMINISTRATOR' : 'TEAM_MEMBER',
      roleId: assignedRole.id,
    },
  });

  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: buildEmailVerificationEmail(`${env.NEXT_PUBLIC_APP_URL}/auth/verify-email/${emailVerificationToken}`),
  });

  const session = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set('session_token', session.token, {
    ...COOKIE_OPTIONS,
    expires: session.expiresAt,
  });

  return { success: true, data: { userId: user.id, organizationId: organization.id, isPersonalMode: false } };
}

export async function loginUser(formData: FormData) {
  if (!(await enforceAuthRateLimit('login'))) return RATE_LIMIT_ERROR;

  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });
  if (!user || !user.passwordHash) {
    return { success: false, error: { message: 'Invalid email or password' } };
  }

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: { message: 'Invalid email or password' } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const session = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set('session_token', session.token, {
    ...COOKIE_OPTIONS,
    expires: session.expiresAt,
  });
  return { success: true, data: { userId: user.id, email: user.email } };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (token) {
    await deleteSession(token);
    cookieStore.delete('session_token');
  }
  redirect('/auth/login');
}

export async function requestPasswordReset(formData: FormData) {
  if (!(await enforceAuthRateLimit('password-reset-request'))) return RATE_LIMIT_ERROR;

  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.pick({ email: true }).safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid email' } };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });

  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expiresAt },
    });

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: buildPasswordResetEmail(`${env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`),
    });
  }

  return { success: true };
}

export async function resetPassword(token: string, formData: FormData) {
  if (!(await enforceAuthRateLimit('password-reset'))) return RATE_LIMIT_ERROR;

  const raw = Object.fromEntries(formData);
  const parsed = z.object({ password: passwordSchema }).safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid password format' } };
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token, passwordResetExpires: { gte: new Date() }, deletedAt: null },
  });

  if (!user) {
    return { success: false, error: { message: 'Invalid or expired reset token' } };
  }

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
  });

  return { success: true };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token, deletedAt: null },
  });

  if (!user) {
    return { success: false, error: { message: 'Invalid or expired verification token' } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date(), emailVerificationToken: null },
  });

  return { success: true };
}

export async function resendVerificationEmail(formData: FormData) {
  if (!(await enforceAuthRateLimit('resend-verification'))) return RATE_LIMIT_ERROR;

  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.pick({ email: true }).safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: { message: 'Invalid email' } };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email, deletedAt: null } });

  if (user && !user.emailVerifiedAt) {
    const token = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token },
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: buildEmailVerificationEmail(`${env.NEXT_PUBLIC_APP_URL}/auth/verify-email/${token}`),
    });
  }

  return { success: true };
}

export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };
  if (!user.isPersonalMode && !hasPermission(user.role, 'task:create')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { assigneeIds, workflowId, ...taskData } = parsed.data;

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        title: taskData.title,
        description: taskData.description ? sanitizeUserGeneratedContent(taskData.description) : null,
        projectId: taskData.projectId,
        workflowId: workflowId,
        status: taskData.status ?? 'TODO',
        priority: taskData.priority ?? 'MEDIUM',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        estimatedHours: taskData.estimatedHours,
        parentTaskId: taskData.parentTaskId,
        createdBy: user.id,
        assignedBy: assigneeIds?.length ? user.id : null,
        customFields: (taskData.customFields ?? {}) as object,
      },
    });

    if (assigneeIds?.length) {
      await tx.taskAssignee.createMany({
        data: assigneeIds.map((assigneeId) => ({
          userId: assigneeId,
          taskId: created.id,
          assignedBy: user.id,
          organizationId: user.organizationId,
        })),
      });
    }

    if (taskData.labelIds?.length) {
      await tx.taskLabel.createMany({
        data: taskData.labelIds.map((labelId) => ({
          taskId: created.id,
          labelId,
          organizationId: user.organizationId,
        })),
      });
    }

    return created;
  });

  try {
    const project = await prisma.project.findUnique({
      where: { id: taskData.projectId },
      select: { organizationId: true },
    });
    if (project && project.organizationId) {
      await evaluateAutomationRules(project.organizationId, 'TASK_CREATED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        assigneeIds: assigneeIds ?? [],
        priority: taskData.priority ?? 'MEDIUM',
        status: taskData.status ?? 'TODO',
      });
    }
  } catch (error) {
    console.error('Automation rule evaluation failed for TASK_CREATED:', error);
  }

  revalidatePath(`/projects/${taskData.projectId}`);
  return { success: true, data: task };
}

export async function updateTask(taskId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const parsed = updateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { select: { userId: true } },
      project: { select: { organizationId: true, isPersonal: true } },
    },
  });
  if (!existingTask || (existingTask.project.organizationId && existingTask.project.organizationId !== user.organizationId)) {
    return { success: false, error: { message: 'Task not found' } };
  }

  const isAssignee = existingTask.assignees.some((a) => a.userId === user.id);
  if (!user.isPersonalMode && !hasPermission(user.role, 'task:update') && !isAssignee) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  if (existingTask.status === 'DONE' && !hasPermission(user.role, 'task:update')) {
    return { success: false, error: { message: 'Completed tasks cannot be edited unless reopened' } };
  }

  const { assigneeIds, labelIds, ...updateData } = parsed.data;

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: sanitizeUserGeneratedContent(updateData.description ?? '') }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.priority && { priority: updateData.priority }),
        ...(updateData.dueDate !== undefined && { dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null }),
        ...(updateData.startDate !== undefined && { startDate: updateData.startDate ? new Date(updateData.startDate) : null }),
        ...(updateData.estimatedHours !== undefined && { estimatedHours: updateData.estimatedHours }),
        ...(updateData.parentTaskId !== undefined && { parentTaskId: updateData.parentTaskId }),
        updatedBy: user.id,
      },
    });

    if (assigneeIds) {
      await tx.taskAssignee.deleteMany({ where: { taskId } });
      if (assigneeIds.length) {
        await tx.taskAssignee.createMany({
          data: assigneeIds.map((assigneeId) => ({
            userId: assigneeId,
            taskId,
            assignedBy: user.id,
            organizationId: user.organizationId,
          })),
        });
      }
    }

    if (labelIds) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      if (labelIds.length) {
        await tx.taskLabel.createMany({
          data: labelIds.map((labelId) => ({ taskId, labelId, organizationId: user.organizationId })),
        });
      }
    }

    return updated;
  });

  try {
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { organizationId: true },
    });
    if (project && project.organizationId) {
      const oldStatus = existingTask.status;
      const newStatus = task.status;
      await evaluateAutomationRules(project.organizationId, 'TASK_UPDATED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        changes: updateData,
      });
      if (oldStatus !== newStatus) {
        await evaluateAutomationRules(project.organizationId, 'TASK_STATUS_CHANGED', {
          taskId: task.id,
          projectId: task.projectId,
          userId: user.id,
          oldStatus,
          newStatus,
        });
      }
    }
  } catch (error) {
    console.error('Automation rule evaluation failed for TASK_UPDATED:', error);
  }

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: task };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const validStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'] as const;
  if (!validStatuses.includes(status as typeof validStatuses[number])) {
    return { success: false, error: { message: 'Invalid status' } };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { include: { user: { select: { id: true } } } },
      project: { select: { name: true, organizationId: true, isPersonal: true } },
    },
  });
  if (!task || (task.project.organizationId && task.project.organizationId !== user.organizationId)) {
    return { success: false, error: { message: 'Task not found' } };
  }

  const isAssignee = task.assignees.some((a) => a.userId === user.id);
  if (!user.isPersonalMode && !hasPermission(user.role, 'task:update') && !isAssignee) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as typeof validStatuses[number],
      ...(status === 'DONE' ? { completedAt: new Date() } : { completedAt: null }),
      updatedBy: user.id,
    },
  });

  if (status === 'DONE' && task.project.organizationId) {
    const managerIds = task.assignees.map((a) => a.user.id).filter((id) => id !== user.id);
    await notifyTaskCompleted(taskId, task.title, `${user.firstName} ${user.lastName}`, user.id, managerIds, task.project.organizationId);
  }

  try {
    if (task.project.organizationId) {
      await evaluateAutomationRules(task.project.organizationId, 'TASK_STATUS_CHANGED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        oldStatus: task.status,
        newStatus: status,
      });
    }
  } catch (error) {
    console.error('Automation rule evaluation failed for TASK_STATUS_CHANGED:', error);
  }

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: updatedTask };
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { organizationId: true, isPersonal: true } } },
  });
  if (!task || (task.project.organizationId && task.project.organizationId !== user.organizationId)) {
    return { success: false, error: { message: 'Task not found' } };
  }

  if (!user.isPersonalMode && !hasPermission(user.role, 'task:delete') && task.createdBy !== user.id) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/tasks');
  return { success: true };
}

const BULK_TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'] as const;

export async function bulkUpdateTaskStatus(taskIds: string[], status: string) {
  const user = await getCurrentUser();
  if (!user || (!user.isPersonalMode && !hasPermission(user.role, 'task:update'))) {
    return { success: false, error: { message: 'Permission denied' } };
  }
  if (!BULK_TASK_STATUSES.includes(status as typeof BULK_TASK_STATUSES[number])) {
    return { success: false, error: { message: 'Invalid status' } };
  }

  const result = await prisma.task.updateMany({
    where: { id: { in: taskIds }, project: { organizationId: user.organizationId ?? undefined }, deletedAt: null },
    data: {
      status: status as typeof BULK_TASK_STATUSES[number],
      updatedBy: user.id,
      ...(status === 'DONE' ? { completedAt: new Date() } : { completedAt: null }),
    },
  });

  revalidatePath('/tasks');
  return { success: true, data: { count: result.count } };
}

export async function bulkAssignTasks(taskIds: string[], assigneeId: string) {
  const user = await getCurrentUser();
  if (!user || user.isPersonalMode || !hasPermission(user.role, 'task:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const [validTasks, assignee] = await Promise.all([
    prisma.task.findMany({
      where: { id: { in: taskIds }, project: { organizationId: user.organizationId }, deletedAt: null },
      select: { id: true },
    }),
    prisma.user.findFirst({ where: { id: assigneeId, organizationId: user.organizationId, deletedAt: null } }),
  ]);
  if (!assignee) return { success: false, error: { message: 'User not found' } };
  if (validTasks.length === 0) return { success: false, error: { message: 'No valid tasks selected' } };

  await prisma.$transaction(
    validTasks.map((task) =>
      prisma.taskAssignee.upsert({
        where: { userId_taskId: { userId: assigneeId, taskId: task.id } },
        update: {},
        create: { userId: assigneeId, taskId: task.id, assignedBy: user.id, organizationId: user.organizationId },
      }),
    ),
  );

  revalidatePath('/tasks');
  return { success: true, data: { count: validTasks.length } };
}

export async function bulkDeleteTasks(taskIds: string[]) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, project: { organizationId: user.organizationId ?? undefined }, deletedAt: null },
    select: { id: true, createdBy: true },
  });

  const deletableIds = tasks
    .filter((t) => user.isPersonalMode || hasPermission(user.role, 'task:delete') || t.createdBy === user.id)
    .map((t) => t.id);
  if (deletableIds.length === 0) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.task.updateMany({
    where: { id: { in: deletableIds } },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/tasks');
  return { success: true, data: { count: deletableIds.length } };
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };
  if (!user.isPersonalMode && !hasPermission(user.role, 'project:create')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status ?? 'PLANNING',
      visibility: parsed.data.visibility ?? 'PRIVATE',
      color: parsed.data.color,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      leadId: parsed.data.leadId ?? null,
      ownerId: user.id,
      organizationId: user.organizationId,
      createdBy: user.id,
    },
  });

  try {
    if (user.organizationId) {
      await evaluateAutomationRules(user.organizationId, 'PROJECT_CREATED', {
        projectId: project.id,
        userId: user.id,
      });
    }
  } catch (error) {
    console.error('Automation rule evaluation failed for PROJECT_CREATED:', error);
  }

  revalidatePath('/projects');
  return { success: true, data: project };
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'project:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = updateProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!existingProject) return { success: false, error: { message: 'Project not found' } };

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.visibility && { visibility: parsed.data.visibility }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      ...(parsed.data.startDate !== undefined && { startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null }),
      ...(parsed.data.endDate !== undefined && { endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null }),
      ...(parsed.data.leadId !== undefined && { leadId: parsed.data.leadId }),
      updatedBy: user.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: project };
}

export async function deleteProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'project:delete')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!existingProject) return { success: false, error: { message: 'Project not found' } };

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date(), isArchived: true },
    }),
    prisma.task.updateMany({
      where: { projectId },
      data: { deletedAt: new Date() },
    }),
  ]);

  revalidatePath('/projects');
  return { success: true };
}

export async function addComment(taskId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const parsed = createCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const comment = await prisma.comment.create({
    data: {
      message: sanitizeUserGeneratedContent(parsed.data.message),
      taskId,
      authorId: user.id,
      parentCommentId: parsed.data.parentCommentId,
    },
  });

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { organizationId: true } } },
    });
    if (task && task.project.organizationId) {
      await evaluateAutomationRules(task.project.organizationId, 'COMMENT_ADDED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        commentId: comment.id,
      });
    }
  } catch (error) {
    console.error('Automation rule evaluation failed for COMMENT_ADDED:', error);
  }

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: comment };
}

export async function updateComment(commentId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const parsed = updateCommentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== user.id) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { message: sanitizeUserGeneratedContent(parsed.data.message), isEdited: true },
  });

  revalidatePath(`/tasks/${comment.taskId}`);
  return { success: true, data: updated };
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== user.id) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/tasks/${comment.taskId}`);
  return { success: true };
}

export async function createTeam(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:create')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createTeamSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const team = await prisma.$transaction(async (tx) => {
    const created = await tx.team.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        organizationId: user.organizationId,
        createdBy: user.id,
      },
    });

    if (parsed.data.memberIds?.length) {
      await tx.userTeam.createMany({
        data: parsed.data.memberIds.map((memberId) => ({
          userId: memberId,
          teamId: created.id,
          organizationId: user.organizationId,
        })),
      });
    }

    return created;
  });

  revalidatePath('/teams');
  return { success: true, data: team };
}

export async function deleteTeam(teamId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:delete')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const existingTeam = await prisma.team.findFirst({
    where: { id: teamId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!existingTeam) return { success: false, error: { message: 'Team not found' } };

  await prisma.team.update({
    where: { id: teamId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/teams');
  return { success: true };
}

export async function updateTeam(teamId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = updateTeamSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const existingTeam = await prisma.team.findFirst({
    where: { id: teamId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!existingTeam) return { success: false, error: { message: 'Team not found' } };

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    },
  });

  revalidatePath(`/teams/${teamId}`);
  return { success: true, data: team };
}

export async function addTeamMember(teamId: string, memberUserId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const [team, member] = await Promise.all([
    prisma.team.findFirst({ where: { id: teamId, organizationId: user.organizationId, deletedAt: null } }),
    prisma.user.findFirst({ where: { id: memberUserId, organizationId: user.organizationId, deletedAt: null } }),
  ]);
  if (!team) return { success: false, error: { message: 'Team not found' } };
  if (!member) return { success: false, error: { message: 'User not found' } };

  const existing = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId: memberUserId, teamId } },
  });
  if (existing) return { success: false, error: { message: 'User is already a member of this team' } };

  await prisma.userTeam.create({
    data: { userId: memberUserId, teamId, organizationId: user.organizationId },
  });

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function removeTeamMember(teamId: string, memberUserId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const team = await prisma.team.findFirst({
    where: { id: teamId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!team) return { success: false, error: { message: 'Team not found' } };

  await prisma.userTeam.deleteMany({ where: { teamId, userId: memberUserId } });

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function updateUserProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath('/profile');
  return { success: true, data: updated };
}

export async function changePassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser?.passwordHash) {
    return { success: false, error: { message: 'Cannot change password for this account' } };
  }

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.compare(parsed.data.currentPassword, currentUser.passwordHash);
  if (!valid) {
    return { success: false, error: { message: 'Current password is incorrect' } };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}

export async function createUser(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.isPersonalMode || !hasPermission(user.role, 'user:create')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const bcrypt = await import('bcryptjs');
  const tempPassword = Math.random().toString(36).slice(-12);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  if (!user.organizationId) {
    return { success: false, error: { message: 'Organization required' } };
  }

  const roles = await ensureSystemRolesForOrg(user.organizationId);

  const newUser = await prisma.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      organizationId: user.organizationId,
      roleId: roles.member.id,
    },
  });

  return { success: true, data: { ...newUser, tempPassword } };
}

export async function deactivateUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'user:deactivate')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const targetUser = await prisma.user.findFirst({
    where: { id: userId, organizationId: user.organizationId, deletedAt: null },
  });
  if (!targetUser) return { success: false, error: { message: 'User not found' } };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  await deleteUserSessions(userId);

  revalidatePath('/admin/users');
  return { success: true };
}

export async function markNotificationRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath('/notifications');
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath('/notifications');
  return { success: true };
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const raw = Object.fromEntries(formData);
  const notificationEmailEnabled = raw.notificationEmailEnabled === 'true';
  const notificationInAppEnabled = raw.notificationInAppEnabled === 'true';
  const theme = (raw.theme as string) ?? 'system';
  const language = (raw.language as string) ?? 'en';

  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: { notificationEmailEnabled, notificationInAppEnabled, theme, language },
    create: { userId: user.id, notificationEmailEnabled, notificationInAppEnabled, theme, language },
  });

  return { success: true };
}

export async function updateSlackWebhook(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.isPersonalMode || !hasPermission(user.role, 'organization:update')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  if (!user.organizationId) {
    return { success: false, error: { message: 'Organization required' } };
  }

  const raw = String(formData.get('slackWebhookUrl') ?? '').trim();
  if (raw && !raw.startsWith('https://hooks.slack.com/')) {
    return { success: false, error: { message: 'Must be a valid Slack incoming webhook URL' } };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { settings: true },
  });
  const settings = (organization?.settings ?? {}) as Record<string, unknown>;

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: { settings: { ...settings, slackWebhookUrl: raw || undefined } },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function getCalendarFeedUrl() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { calendarToken: true } });
  let token = dbUser?.calendarToken;

  if (!token) {
    token = crypto.randomUUID();
    await prisma.user.update({ where: { id: user.id }, data: { calendarToken: token } });
  }

  return { success: true, data: { url: `${env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/${token}/feed.ics` } };
}

export async function regenerateCalendarFeedToken() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const token = crypto.randomUUID();
  await prisma.user.update({ where: { id: user.id }, data: { calendarToken: token } });

  revalidatePath('/settings');
  return { success: true, data: { url: `${env.NEXT_PUBLIC_APP_URL}/api/v1/calendar/${token}/feed.ics` } };
}
