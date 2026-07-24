import { cookies } from 'next/headers';
import { validateSession } from '@/lib/session';
import { NextResponse } from 'next/server';
import type { SessionUser } from '@/types';
import { getRoleFromString } from '@/lib/auth';

export async function getApiUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    const user = await validateSession(token);
    if (!user) return null;
    return { ...user, role: getRoleFromString(user.role) };
  } catch {
    return null;
  }
}

export async function requireApiAuth(): Promise<SessionUser> {
  const user = await getApiUser();
  if (!user) {
    throw new ApiAuthError('Unauthorized');
  }
  return user;
}

export async function requireApiRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireApiAuth();
  if (!roles.includes(user.role)) {
    throw new ApiAuthError('Forbidden');
  }
  return user;
}

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiAuthError && error.message === 'Unauthorized') {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }
  if (error instanceof ApiAuthError && error.message === 'Forbidden') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } },
      { status: 403 }
    );
  }
  console.error('API Error:', error);
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 }
  );
}
