/** The display name of the application. */
export const APP_NAME = 'Professional Task Manager';

/** The current semantic version of the application. */
export const APP_VERSION = '0.1.0';

/** Pagination-related constants. */
export const PAGINATION = {
  /** Default number of items per page when no limit is specified. */
  DEFAULT_LIMIT: 20,
  /** Hard upper bound for items per page to prevent abuse. */
  MAX_LIMIT: 100,
} as const;

/** File upload constraints. */
export const FILE = {
  /** Maximum size in bytes for a single uploaded file (10 MB). */
  MAX_SIZE_PER_FILE: 10 * 1024 * 1024,
  /** Maximum cumulative size in bytes for all files attached to a single task (50 MB). */
  MAX_SIZE_PER_TASK: 50 * 1024 * 1024,
  /** MIME types that are permitted for file uploads. */
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif',
    'text/plain',
  ] as string[],
} as const;

/** Validation constraints for user input fields. */
export const VALIDATION = {
  /** Minimum number of characters for a password. */
  PASSWORD_MIN_LENGTH: 8,
  /** Maximum number of characters for a task or project title. */
  TITLE_MAX_LENGTH: 200,
  /** Maximum number of characters for a task or project description. */
  DESCRIPTION_MAX_LENGTH: 5000,
  /** Maximum number of characters for a comment body. */
  COMMENT_MAX_LENGTH: 2000,
  /** Maximum number of characters for a user's first or last name. */
  NAME_MAX_LENGTH: 100,
} as const;

/** Rate-limit thresholds for API endpoints. */
export const RATE_LIMIT = {
  /** Maximum requests per hour for authenticated users. */
  AUTHENTICATED_PER_HOUR: 1000,
  /** Maximum burst requests per minute for authenticated users. */
  AUTHENTICATED_BURST_PER_MINUTE: 100,
  /** Maximum requests per hour for unauthenticated visitors. */
  ANONYMOUS_PER_HOUR: 100,
} as const;

/** Notification-related timing constants. */
export const NOTIFICATION = {
  /** Minimum interval in milliseconds between notification polls or dispatches. */
  LATENCY_MS: 60000,
  /** Number of hours before a task's due date to send a reminder notification. */
  DUE_DATE_REMINDER_HOURS: 24,
} as const;

/** Data retention and cleanup intervals. */
export const AUDIT = {
  /** Number of days to retain audit log entries before purging. */
  RETENTION_DAYS: 90,
} as const;

/** Cache time-to-live values in seconds for various data categories. */
export const CACHE = {
  /** TTL in seconds for project data cached on the server. */
  PROJECT_TTL_SECONDS: 300,
  /** TTL in seconds for individual task data. */
  TASK_TTL_SECONDS: 60,
  /** TTL in seconds for team / project member data. */
  MEMBERS_TTL_SECONDS: 300,
} as const;

/** Human-readable labels mapped to internal task status enum values. */
export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  ARCHIVED: 'Archived',
};

/** Human-readable labels mapped to internal priority enum values. */
export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

/** Human-readable labels mapped to internal project status enum values. */
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

/**
 * Navigation items for the application sidebar and top navigation.
 * Each entry includes the display label, route href, and the user roles that are
 * permitted to see and access the link.
 */
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'Projects', href: '/projects', roles: ['ADMINISTRATOR', 'MANAGER'] as const },
  { label: 'Tasks', href: '/tasks', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'Teams', href: '/teams', roles: ['ADMINISTRATOR', 'MANAGER'] as const },
  { label: 'Reports', href: '/reports', roles: ['ADMINISTRATOR', 'MANAGER'] as const },
  { label: 'Notifications', href: '/notifications', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'Profile', href: '/profile', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'Settings', href: '/settings', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'System Journey', href: '/guide', roles: ['ADMINISTRATOR', 'MANAGER', 'TEAM_MEMBER'] as const },
  { label: 'User Management', href: '/admin/users', roles: ['ADMINISTRATOR'] as const },
  { label: 'Organization', href: '/admin/organization', roles: ['ADMINISTRATOR'] as const },
  { label: 'Admin Dashboard', href: '/admin', roles: ['ADMINISTRATOR'] as const },
] as const;
