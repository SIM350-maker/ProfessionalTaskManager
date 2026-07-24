import { headers } from 'next/headers';

export const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': CSP_HEADER,
};

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeUserGeneratedContent(input: string): string {
  return sanitizeHtml(input.trim());
}

export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif',
    'text/plain',
  ];
  return allowedTypes.includes(mimeType);
}

export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

export async function getRequestId(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-request-id') ?? crypto.randomUUID();
}

export function maskSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveFields: string[],
): Partial<T> {
  const masked = { ...obj };
  for (const field of sensitiveFields) {
    if (field in masked) {
      delete masked[field];
    }
  }
  return masked;
}
