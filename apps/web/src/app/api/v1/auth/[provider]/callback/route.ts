import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';
import { createSession } from '@/lib/session';
import { env } from '@/lib/config/env';
import { isOAuthProvider, completeOAuthFlow, OAUTH_STATE_COOKIE } from '@/lib/oauth';
import { generateSlug } from '@/lib/helpers';
import { ensureSystemRolesForOrg } from '@/services/roles';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function loginRedirect(error: string): NextResponse {
  const url = new URL('/auth/login', env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Unknown OAuth provider' } }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect('oauth_state_mismatch');
  }

  let profile;
  try {
    profile = await completeOAuthFlow(provider, code);
  } catch (error) {
    console.error(`OAuth callback failed for ${provider}:`, error);
    return loginRedirect('oauth_failed');
  }

  let user = await prisma.user.findUnique({ where: { email: profile.email, deletedAt: null } });

  if (!user) {
    const organization = await prisma.organization.create({
      data: {
        name: `${profile.firstName}'s Workspace`,
        slug: `${generateSlug(profile.firstName)}-${crypto.randomUUID().slice(0, 8)}`,
      },
    });

    const roles = await ensureSystemRolesForOrg(organization.id);

    user = await prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        organizationId: organization.id,
        emailVerifiedAt: new Date(),
        role: 'ADMINISTRATOR',
        roleId: roles.admin.id,
      },
    });
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  }

  const session = await createSession(user.id);
  cookieStore.set('session_token', session.token, {
    ...SESSION_COOKIE_OPTIONS,
    expires: session.expiresAt,
  });

  return NextResponse.redirect(new URL('/dashboard', env.NEXT_PUBLIC_APP_URL));
}
