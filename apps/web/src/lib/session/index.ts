import { prisma } from '@/lib/database';

/**
 * Duration (in milliseconds) after which a session expires.
 * Default: 7 days.
 */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Creates a new session for the given user, persisting it to the database.
 *
 * @param userId - The ID of the user to create a session for.
 * @returns An object containing the generated session token and its expiration date.
 */
export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return { token, expiresAt };
}

/**
 * Validates a session token against the database.
 *
 * - If the session exists and has not expired, the associated user data is returned.
 * - If the session has expired, it is automatically deleted and `null` is returned.
 * - If no matching session is found, `null` is returned.
 *
 * @param token - The session token to validate.
 * @returns The session user object (without sensitive fields), or `null` if invalid or expired.
 */
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organizationId: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    organizationId: session.user.organizationId,
    avatarUrl: session.user.avatarUrl,
    role: session.user.role,
  };
}

/**
 * Deletes a single session by its token (e.g. for logout).
 *
 * @param token - The session token to remove.
 */
export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

/**
 * Invalidates all sessions belonging to a user (e.g. on password change or account deactivation).
 *
 * @param userId - The ID of the user whose sessions should be deleted.
 */
export async function deleteUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
