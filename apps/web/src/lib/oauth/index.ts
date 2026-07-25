import { env } from '@/lib/config/env';

export const OAUTH_STATE_COOKIE = 'oauth_state';

export type OAuthProvider = 'google' | 'github' | 'microsoft';

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ['google', 'github', 'microsoft'];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
}

function getProviderConfig(provider: OAuthProvider): ProviderConfig {
  switch (provider) {
    case 'google':
      return {
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'openid email profile',
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      };
    case 'github':
      return {
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'read:user user:email',
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      };
    case 'microsoft':
      return {
        authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        scope: 'openid email profile User.Read',
        clientId: env.MICROSOFT_CLIENT_ID,
        clientSecret: env.MICROSOFT_CLIENT_SECRET,
      };
  }
}

export function isOAuthProviderConfigured(provider: OAuthProvider): boolean {
  const config = getProviderConfig(provider);
  return !!(config.clientId && config.clientSecret);
}

function getRedirectUri(provider: OAuthProvider): string {
  return `${env.NEXT_PUBLIC_APP_URL}/api/v1/auth/${provider}/callback`;
}

export function getAuthorizeUrl(provider: OAuthProvider, state: string): string {
  const config = getProviderConfig(provider);
  const url = new URL(config.authorizeUrl);
  url.searchParams.set('client_id', config.clientId ?? '');
  url.searchParams.set('redirect_uri', getRedirectUri(provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  return url.toString();
}

async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<string> {
  const config = getProviderConfig(provider);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      client_id: config.clientId ?? '',
      client_secret: config.clientSecret ?? '',
      code,
      redirect_uri: getRedirectUri(provider),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`${provider} token exchange failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`${provider} token exchange returned no access token${data.error ? `: ${data.error}` : ''}`);
  }
  return data.access_token;
}

export interface OAuthProfile {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

async function fetchProfile(provider: OAuthProvider, accessToken: string): Promise<OAuthProfile> {
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  if (provider === 'google') {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: authHeader });
    if (!res.ok) throw new Error('Failed to fetch Google profile');
    const data = (await res.json()) as { email: string; given_name?: string; family_name?: string; picture?: string };
    return {
      email: data.email,
      firstName: data.given_name ?? data.email.split('@')[0] ?? 'User',
      lastName: data.family_name ?? '',
      avatarUrl: data.picture,
    };
  }

  if (provider === 'github') {
    const [userRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers: { ...authHeader, Accept: 'application/vnd.github+json' } }),
      fetch('https://api.github.com/user/emails', { headers: { ...authHeader, Accept: 'application/vnd.github+json' } }),
    ]);
    if (!userRes.ok) throw new Error('Failed to fetch GitHub profile');
    const user = (await userRes.json()) as { name?: string; login: string; avatar_url?: string; email?: string | null };

    let email = user.email ?? null;
    if (!email && emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails.find((e) => e.verified)?.email ?? null;
    }
    if (!email) throw new Error('GitHub account has no accessible verified email');

    const [firstName, ...rest] = (user.name ?? user.login).split(' ');
    return {
      email,
      firstName: firstName || user.login,
      lastName: rest.join(' '),
      avatarUrl: user.avatar_url,
    };
  }

  // microsoft
  const res = await fetch('https://graph.microsoft.com/v1.0/me', { headers: authHeader });
  if (!res.ok) throw new Error('Failed to fetch Microsoft profile');
  const data = (await res.json()) as { mail?: string; userPrincipalName: string; givenName?: string; surname?: string };
  const email = data.mail ?? data.userPrincipalName;
  return {
    email,
    firstName: data.givenName ?? email.split('@')[0] ?? 'User',
    lastName: data.surname ?? '',
  };
}

export async function completeOAuthFlow(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
  const accessToken = await exchangeCodeForToken(provider, code);
  return fetchProfile(provider, accessToken);
}
