import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  session: {
    create: vi.fn(),
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('@/lib/database', () => ({
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createSession', () => {
  it('creates a session with token and expiry', async () => {
    const { createSession } = await import('@/lib/session');
    mockPrisma.session.create.mockResolvedValue({ id: 'session-1', userId: 'user-1', token: 'mock-token', expiresAt: new Date() });

    const result = await createSession('user-1');

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('expiresAt');
    expect(mockPrisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        token: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    });
  });
});

describe('validateSession', () => {
  it('returns null for invalid token', async () => {
    const { validateSession } = await import('@/lib/session');
    mockPrisma.session.findUnique.mockResolvedValue(null);

    const result = await validateSession('invalid-token');
    expect(result).toBeNull();
  });

  it('returns null for expired session', async () => {
    const { validateSession } = await import('@/lib/session');
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      token: 'expired-token',
      expiresAt: new Date('2020-01-01'),
      user: { id: 'user-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe', organizationId: 'org-1', avatarUrl: null, role: 'TEAM_MEMBER' },
    });

    const result = await validateSession('expired-token');
    expect(result).toBeNull();
    expect(mockPrisma.session.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
  });

  it('returns user data for valid session', async () => {
    const { validateSession } = await import('@/lib/session');
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    mockPrisma.session.findUnique.mockResolvedValue({
      id: 'session-1',
      token: 'valid-token',
      expiresAt: future,
      user: {
        id: 'user-1',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-1',
        avatarUrl: null,
        role: 'TEAM_MEMBER',
      },
    });

    const result = await validateSession('valid-token');
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: 'org-1',
      avatarUrl: null,
      role: 'TEAM_MEMBER',
    });
  });
});

describe('deleteSession', () => {
  it('deletes the session by token', async () => {
    const { deleteSession } = await import('@/lib/session');
    await deleteSession('token-123');
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({ where: { token: 'token-123' } });
  });
});

describe('deleteUserSessions', () => {
  it('deletes all sessions for user', async () => {
    const { deleteUserSessions } = await import('@/lib/session');
    await deleteUserSessions('user-1');
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});