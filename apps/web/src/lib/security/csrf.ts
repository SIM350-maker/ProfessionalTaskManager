import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const CSRF_TOKEN_COOKIE = 'csrf_token';
export const CSRF_TOKEN_HEADER = 'x-csrf-token';

export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  if (!cookieToken || !token) {
    return false;
  }
  return token === cookieToken;
}

/**
 * Enforces the double-submit CSRF check on a mutating route: the client fetches a
 * token from GET /api/v1/csrf (which also sets the httpOnly cookie) and echoes it
 * back via the X-CSRF-Token header on POST/PATCH/DELETE requests.
 *
 * @returns A 403 NextResponse if the token is missing/invalid, otherwise `null`.
 */
export async function requireCsrfToken(request: NextRequest): Promise<NextResponse | null> {
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  const valid = headerToken ? await validateCsrfToken(headerToken) : false;

  if (!valid) {
    return NextResponse.json(
      { success: false, error: { code: 'CSRF_INVALID', message: 'Invalid or missing CSRF token' } },
      { status: 403 },
    );
  }

  return null;
}
