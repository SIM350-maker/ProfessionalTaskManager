import { prisma } from '@/lib/database';
import { sendEmail, buildTaskAssignmentEmail, buildDueDateReminderEmail, buildTaskCompletedEmail } from '@/services/email';
import { sendSlackNotification } from '@/services/integrations/slack';

type NotificationType = 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'DUE_DATE_REMINDER' | 'TASK_REASSIGNED' | 'COMMENT_ADDED';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message?: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actionUrl?: string;
  userId: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  await prisma.notification.create({
    data: {
      type: params.type,
      title: params.title,
      message: params.message,
      entityType: params.entityType,
      entityId: params.entityId,
      actorId: params.actorId,
      actionUrl: params.actionUrl,
      userId: params.userId,
    },
  });
}

export async function notifyTaskAssigned(
  taskId: string,
  taskTitle: string,
  projectName: string,
  assignedByUserName: string,
  assigneeUserId: string,
  assignedById: string,
): Promise<void> {
  const prefs = await prisma.userPreferences.findUnique({ where: { userId: assigneeUserId } });
  const user = await prisma.user.findUnique({ where: { id: assigneeUserId }, select: { email: true, firstName: true } });
  if (!user) return;

  const actionUrl = `/tasks/${taskId}`;

  if (prefs?.notificationInAppEnabled ?? true) {
    await createNotification({
      type: 'TASK_ASSIGNED',
      title: 'New Task Assignment',
      message: `You have been assigned "${taskTitle}" in ${projectName}`,
      entityType: 'Task',
      entityId: taskId,
      actorId: assignedById,
      actionUrl,
      userId: assigneeUserId,
    });
  }

  if (prefs?.notificationEmailEnabled ?? true) {
    await sendEmail({
      to: user.email,
      subject: `New Task: ${taskTitle}`,
      html: buildTaskAssignmentEmail(taskTitle, projectName, assignedByUserName),
    });
  }
}

export async function notifyTaskCompleted(
  taskId: string,
  taskTitle: string,
  completedByUser: string,
  completedById: string,
  managerUserIds: string[],
  organizationId?: string,
): Promise<void> {
  if (organizationId) {
    await sendSlackNotification(organizationId, `:white_check_mark: *${taskTitle}* was completed by ${completedByUser}`);
  }

  if (managerUserIds.length === 0) return;

  const actionUrl = `/tasks/${taskId}`;

  const [prefsList, users] = await Promise.all([
    prisma.userPreferences.findMany({ where: { userId: { in: managerUserIds } } }),
    prisma.user.findMany({ where: { id: { in: managerUserIds } }, select: { id: true, email: true } }),
  ]);
  const prefsByUserId = new Map(prefsList.map((p) => [p.userId, p]));
  const usersById = new Map(users.map((u) => [u.id, u]));

  for (const userId of managerUserIds) {
    const prefs = prefsByUserId.get(userId);
    const user = usersById.get(userId);
    if (!user) continue;

    if (prefs?.notificationInAppEnabled ?? true) {
      await createNotification({
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: `"${taskTitle}" was completed by ${completedByUser}`,
        entityType: 'Task',
        entityId: taskId,
        actorId: completedById,
        actionUrl,
        userId,
      });
    }

    if (prefs?.notificationEmailEnabled ?? true) {
      await sendEmail({
        to: user.email,
        subject: `Task Completed: ${taskTitle}`,
        html: buildTaskCompletedEmail(taskTitle, completedByUser),
      });
    }
  }
}

export async function notifyDueDateReminder(
  taskId: string,
  taskTitle: string,
  dueDate: string,
  userId: string,
): Promise<void> {
  const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return;

  const actionUrl = `/tasks/${taskId}`;

  if (prefs?.notificationInAppEnabled ?? true) {
    await createNotification({
      type: 'DUE_DATE_REMINDER',
      title: 'Task Due Soon',
      message: `"${taskTitle}" is due on ${dueDate}`,
      entityType: 'Task',
      entityId: taskId,
      actionUrl,
      userId,
    });
  }

  if (prefs?.notificationEmailEnabled ?? true) {
    await sendEmail({
      to: user.email,
      subject: `Due Date Reminder: ${taskTitle}`,
      html: buildDueDateReminderEmail(taskTitle, dueDate),
    });
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false, deletedAt: null },
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
