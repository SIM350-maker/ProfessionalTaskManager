import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  organization: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/database', () => ({
  prisma: mockPrisma,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  hasPermission: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => Promise.resolve('$2a$12$hashedpassword')),
  compare: vi.fn((password: string) => Promise.resolve(password === 'Password123')),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('registerUser', () => {
  it('returns success with valid data', async () => {
    const { registerUser } = await import('@/actions');
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.organization.findFirst.mockResolvedValue(null);
    mockPrisma.organization.create.mockResolvedValue({ id: 'org-1', name: 'Test Corp' });
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', organizationId: 'org-1' });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'Password123');
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('organizationName', 'Test Corp');

    const result = await registerUser(formData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ userId: 'user-1', organizationId: 'org-1' });
  });

  it('returns error when email already exists', async () => {
    const { registerUser } = await import('@/actions');
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user', email: 'test@example.com' });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'Password123');
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('organizationName', 'Test Corp');

    const result = await registerUser(formData);
    expect(result.success).toBe(false);
    expect((result.error as { message: string }).message).toBe('Email already registered');
  });
});

describe('loginUser', () => {
  it('returns success with valid credentials', async () => {
    const { loginUser } = await import('@/actions');
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      deletedAt: null,
    });
    mockPrisma.user.update.mockResolvedValue({});
    const { createSession } = await import('@/lib/session');
    (createSession as ReturnType<typeof vi.fn>).mockResolvedValue({ token: 'session-token', expiresAt: new Date() });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'Password123');

    const result = await loginUser(formData);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('userId');
  });

  it('returns error with invalid password', async () => {
    const { loginUser } = await import('@/actions');
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      deletedAt: null,
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    const result = await loginUser(formData);
    expect(result.success).toBe(false);
    expect((result.error as { message: string }).message).toBe('Invalid email or password');
  });
});