export const TTL = {
  DASHBOARD_STATS: 5 * 60,
  PROJECT_LIST: 60,
  USER_PROFILE: 10 * 60,
  ANALYTICS_DATA: 15 * 60,
  SETTINGS: 30 * 60,
} as const;

const PREFIX = {
  DASHBOARD_STATS: 'dashboard:stats',
  PROJECT_LIST: 'projects:list',
  USER_PROFILE: 'user:profile',
  ANALYTICS_DATA: 'analytics',
  SETTINGS: 'settings',
} as const;

export function dashboardStatsKey(userId: string): string {
  return `${PREFIX.DASHBOARD_STATS}:${userId}`;
}

export function projectListKey(teamId: string, filters?: Record<string, string>): string {
  const base = `${PREFIX.PROJECT_LIST}:${teamId}`;
  if (!filters || Object.keys(filters).length === 0) return base;
  const qs = Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `${base}?${qs}`;
}

export function userProfileKey(userId: string): string {
  return `${PREFIX.USER_PROFILE}:${userId}`;
}

export function analyticsDataKey(teamId: string, from: string, to: string): string {
  return `${PREFIX.ANALYTICS_DATA}:${teamId}:${from}:${to}`;
}

export function settingsKey(scope: string, id: string): string {
  return `${PREFIX.SETTINGS}:${scope}:${id}`;
}
