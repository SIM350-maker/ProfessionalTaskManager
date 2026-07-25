import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import { isOAuthProvider, isOAuthProviderConfigured, getAuthorizeUrl, OAUTH_STATE_COOKIE } from '@/lib/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Unknown OAuth provider' } }, { status: 404 });
  }

  if (!isOAuthProviderConfigured(provider)) {
    const url = new URL('/auth/login', env.NEXT_PUBLIC_APP_URL);
    url.searchParams.set('error', 'oauth_not_configured');
    return NextResponse.redirect(url);
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  return NextResponse.redirect(getAuthorizeUrl(provider, state));
}
