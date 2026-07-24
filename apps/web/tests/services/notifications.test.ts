import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  notification: {
    create: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  userPreferences: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

const mockSendEmail = vi.fn();

vi.mock('@/lib/database', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/services/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  buildTaskAssignmentEmail: vi.fn(() => '<html>assigned</html>'),
  buildDueDateReminderEmail: vi.fn(() => '<html>reminder</html>'),
  buildTaskCompletedEmail: vi.fn(() => '<html>completed</html>'),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNotification', () => {
  it('creates an in-app notification', async () => {
    const { createNotification } = await import('@/services/notifications');
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });

    await createNotification({
      type: 'TASK_ASSIGNED',
      title: 'New Task',
      message: 'You have been assigned a task',
      entityType: 'Task',
      entityId: 'task-1',
      actorId: 'user-1',
      actionUrl: '/tasks/task-1',
      userId: 'user-2',
    });

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        type: 'TASK_ASSIGNED',
        title: 'New Task',
        message: 'You have been assigned a task',
        entityType: 'Task',
        entityId: 'task-1',
        actorId: 'user-1',
        actionUrl: '/tasks/task-1',
        userId: 'user-2',
      },
    });
  });
});

describe('notifyTaskAssigned', () => {
  it('creates in-app and email notification', async () => {
    const { notifyTaskAssigned } = await import('@/services/notifications');
    mockPrisma.userPreferences.findUnique.mockResolvedValue({
      userId: 'user-2',
      notificationInAppEnabled: true,
      notificationEmailEnabled: true,
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'user@test.com', firstName: 'Jane' });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });

    await notifyTaskAssigned('task-1', 'Test Task', 'Project A', 'John', 'user-2', 'user-1');

    expect(mockPrisma.notification.create).toHaveBeenCalled();
    expect(mockPrisma.userPreferences.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-2' } });
  });

  it('respects user email preferences when disabled', async () => {
    const { notifyTaskAssigned } = await import('@/services/notifications');
    mockPrisma.userPreferences.findUnique.mockResolvedValue({
      userId: 'user-2',
      notificationInAppEnabled: true,
      notificationEmailEnabled: false,
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'user@test.com', firstName: 'Jane' });
    mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });

    await notifyTaskAssigned('task-1', 'Test Task', 'Project A', 'John', 'user-2', 'user-1');

    expect(mockPrisma.notification.create).toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('getUnreadNotificationCount', () => {
  it('returns count of unread notifications', async () => {
    const { getUnreadNotificationCount } = await import('@/services/notifications');
    mockPrisma.notification.count.mockResolvedValue(5);

    const count = await getUnreadNotificationCount('user-1');
    expect(count).toBe(5);
    expect(mockPrisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false, deletedAt: null },
    });
  });
});

describe('markNotificationAsRead', () => {
  it('updates isRead to true', async () => {
    const { markNotificationAsRead } = await import('@/services/notifications');
    await markNotificationAsRead('notif-1', 'user-1');
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'notif-1', userId: 'user-1' },
      data: { isRead: true },
    });
  });
});