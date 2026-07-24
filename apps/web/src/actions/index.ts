'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { createSession, deleteSession } from '@/lib/session';
import {
  createTaskSchema,
  updateTaskSchema,
  createProjectSchema,
  updateProjectSchema,
  createCommentSchema,
  updateCommentSchema,
  createTeamSchema,
  updateUserSchema,
  changePasswordSchema,
  registerSchema,
  loginSchema,
  passwordSchema,
} from '@/lib/validation';
import { z } from 'zod';
import { sanitizeUserGeneratedContent } from '@/lib/security';
import { notifyTaskCompleted } from '@/services/notifications';
import { evaluateAutomationRules } from '@/services/automation';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export async function registerUser(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { email, password, firstName, lastName, organizationName } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: { message: 'Email already registered' } };
  }

  const existingOrg = await prisma.organization.findFirst({ where: { name: organizationName } });

  const organization = existingOrg ?? await prisma.organization.create({
    data: {
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    },
  });

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash,
      organizationId: organization.id,
      emailVerificationToken: crypto.randomUUID(),
    },
  });

  return { success: true, data: { userId: user.id, organizationId: organization.id } };
}

export async function loginUser(formData: FormData) {
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
  }

  return { success: true };
}

export async function resetPassword(token: string, formData: FormData) {
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
  }

  return { success: true };
}

export async function createTask(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };
  if (!hasPermission(user.role, 'task:create')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  const { assigneeIds, workflowId, ...taskData } = parsed.data;

  const task = await prisma.task.create({
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
    for (const assigneeId of assigneeIds) {
      await prisma.taskAssignee.create({
        data: {
          userId: assigneeId,
          taskId: task.id,
          assignedBy: user.id,
          organizationId: user.organizationId,
        },
      });
    }
  }

  if (taskData.labelIds?.length) {
    for (const labelId of taskData.labelIds) {
      await prisma.taskLabel.create({
        data: { taskId: task.id, labelId, organizationId: user.organizationId },
      });
    }
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: taskData.projectId },
      select: { organizationId: true },
    });
    if (project) {
      await evaluateAutomationRules(project.organizationId, 'TASK_CREATED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        assigneeIds: assigneeIds ?? [],
        priority: taskData.priority ?? 'MEDIUM',
        status: taskData.status ?? 'TODO',
      });
    }
  } catch {
    // automation failures should not block task creation
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
    include: { assignees: { select: { userId: true } } },
  });
  if (!existingTask) return { success: false, error: { message: 'Task not found' } };

  const isAssignee = existingTask.assignees.some((a) => a.userId === user.id);
  if (!hasPermission(user.role, 'task:update') && !isAssignee) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  if (existingTask.status === 'DONE' && !hasPermission(user.role, 'task:update')) {
    return { success: false, error: { message: 'Completed tasks cannot be edited unless reopened' } };
  }

  const { assigneeIds, labelIds, ...updateData } = parsed.data;

  const task = await prisma.task.update({
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
    await prisma.taskAssignee.deleteMany({ where: { taskId } });
    for (const assigneeId of assigneeIds) {
      await prisma.taskAssignee.create({
        data: { userId: assigneeId, taskId, assignedBy: user.id, organizationId: user.organizationId },
      });
    }
  }

  if (labelIds) {
    await prisma.taskLabel.deleteMany({ where: { taskId } });
    for (const labelId of labelIds) {
      await prisma.taskLabel.create({
        data: { taskId, labelId, organizationId: user.organizationId },
      });
    }
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { organizationId: true },
    });
    if (project) {
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
  } catch {
    // automation failures should not block task updates
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
      project: { select: { name: true, organizationId: true } },
    },
  });
  if (!task) return { success: false, error: { message: 'Task not found' } };

  const isAssignee = task.assignees.some((a) => a.userId === user.id);
  if (!hasPermission(user.role, 'task:update') && !isAssignee) {
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

  if (status === 'DONE') {
    const managerIds = task.assignees.map((a) => a.user.id).filter((id) => id !== user.id);
    await notifyTaskCompleted(taskId, task.title, `${user.firstName} ${user.lastName}`, user.id, managerIds);
  }

  try {
    await evaluateAutomationRules(task.project.organizationId, 'TASK_STATUS_CHANGED', {
      taskId: task.id,
      projectId: task.projectId,
      userId: user.id,
      oldStatus: task.status,
      newStatus: status,
    });
  } catch {
    // automation failure should not block status update
  }

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: updatedTask };
}

export async function deleteTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: { message: 'Unauthorized' } };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, error: { message: 'Task not found' } };

  if (!hasPermission(user.role, 'task:delete') && task.createdBy !== user.id) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/tasks');
  return { success: true };
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'project:create')) {
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
      ownerId: user.id,
      organizationId: user.organizationId,
      createdBy: user.id,
    },
  });

  try {
    await evaluateAutomationRules(user.organizationId, 'PROJECT_CREATED', {
      projectId: project.id,
      userId: user.id,
    });
  } catch {
    // automation failure should not block project creation
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

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date(), isArchived: true },
  });

  await prisma.task.updateMany({
    where: { projectId },
    data: { deletedAt: new Date() },
  });

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
    if (task) {
      await evaluateAutomationRules(task.project.organizationId, 'COMMENT_ADDED', {
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        commentId: comment.id,
      });
    }
  } catch {
    // automation failure should not block comment creation
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

  const team = await prisma.team.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      organizationId: user.organizationId,
      createdBy: user.id,
    },
  });

  if (parsed.data.memberIds?.length) {
    for (const memberId of parsed.data.memberIds) {
      await prisma.userTeam.create({
        data: { userId: memberId, teamId: team.id, organizationId: user.organizationId },
      });
    }
  }

  revalidatePath('/teams');
  return { success: true, data: team };
}

export async function deleteTeam(teamId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'team:delete')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/teams');
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
  if (!user || !hasPermission(user.role, 'user:create')) {
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

  const newUser = await prisma.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      organizationId: user.organizationId,
    },
  });

  return { success: true, data: { ...newUser, tempPassword } };
}

export async function deactivateUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, 'user:deactivate')) {
    return { success: false, error: { message: 'Permission denied' } };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

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
