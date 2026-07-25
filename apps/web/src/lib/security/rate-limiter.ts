import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '../config/env';

/**
 * In-memory store for rate-limit entries keyed by a composite identifier.
 * Each entry tracks the request count and the timestamp at which the window resets.
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/** Starts a periodic timer (every 60 s) that evicts expired entries from the in-memory map. */
function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap) {
      if (now > entry.resetAt) {
        rateMap.delete(key);
      }
    }
  }, 60_000);
}

if (typeof globalThis !== 'undefined') {
  startCleanup();
}

/**
 * Configuration for a rate-limit window.
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Duration of the rate-limit window in milliseconds. */
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

/**
 * Distributed rate-limiter backed by Redis, using the Upstash Redis HTTP API.
 * Falls back to allowing the request when Redis is unreachable (fail-open).
 */
class RedisRateLimiter {
  private url: string;
  private token: string;

  constructor(redisUrl: string) {
    const parsed = new URL(redisUrl);
    this.token = parsed.username;
    this.url = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');
  }

  /**
   * Sends a Redis command over HTTP via the Upstash REST API.
   *
   * @param command - The Redis command name (e.g. `EVAL`).
   * @param args - Arguments for the command.
   * @returns The parsed JSON result from Redis.
   */
  private async send(command: string, ...args: string[]): Promise<unknown> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) throw new Error(`Redis request failed: ${res.statusText}`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(`Redis error: ${data.error}`);
    return data.result;
  }

  /**
   * Checks whether a request identified by `key` is allowed under the given rate-limit
   * window. Uses a Redis `EVAL` script to atomically increment and set TTL.
   *
   * @param key - Unique rate-limit key.
   * @param maxRequests - Maximum requests permitted in the window.
   * @param windowMs - Window duration in milliseconds.
   * @returns An object indicating whether the request is allowed, remaining quota, and
   *          milliseconds until the window resets.
   */
  async check(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    try {
      const result = (await this.send(
        'EVAL',
        `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
`,
        '1',
        key,
        String(windowMs),
      )) as [number, number];

      const [current, ttl] = result;
      const remaining = Math.max(0, maxRequests - current);
      return {
        allowed: current <= maxRequests,
        remaining,
        resetIn: Math.max(0, ttl),
      };
    } catch {
      return { allowed: true, remaining: maxRequests, resetIn: windowMs };
    }
  }
}

let redisLimiter: RedisRateLimiter | null = null;

/**
 * Returns a singleton {@link RedisRateLimiter} instance, initialising it from
 * the `REDIS_URL` environment variable on first call.
 */
function getRedisLimiter(): RedisRateLimiter {
  if (!redisLimiter) {
    if (!env.REDIS_URL) throw new Error('REDIS_URL is not configured');
    redisLimiter = new RedisRateLimiter(env.REDIS_URL);
  }
  return redisLimiter;
}

/** @returns `true` when a Redis backend has been configured via `REDIS_URL`. */
function isRedisAvailable(): boolean {
  return !!env.REDIS_URL;
}

/**
 * Checks whether an action identified by `key` is allowed under the given rate-limit config.
 *
 * When Redis is configured (`REDIS_URL`), the check is delegated to the distributed
 * Redis-backed limiter. Otherwise, an in-memory map is used (single-process only).
 *
 * @param key - Unique identifier for the entity being rate-limited (e.g. `"ip:action"`).
 * @param config - Rate-limit window configuration. Defaults to 10 requests per 60 seconds.
 * @returns An object indicating whether the request is allowed, the remaining quota, and the
 *          number of milliseconds until the window resets.
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (isRedisAvailable()) {
    return getRedisLimiter().check(key, config.maxRequests, config.windowMs);
  }

  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
}

/**
 * Builds a rate-limit key from a client IP and an action name.
 *
 * @param ip - The client's IP address.
 * @param action - A label identifying the action being rate-limited.
 * @returns A colon-delimited composite key.
 */
export function getRateLimitKey(ip: string, action: string): string {
  return `${ip}:${action}`;
}

const AUTH_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};

/**
 * Convenience wrapper that applies a strict rate-limit config (5 requests per 15 minutes)
 * intended for authentication-related actions such as login or password reset.
 *
 * @param ip - The client's IP address.
 * @param action - A label identifying the auth action.
 * @returns The result of the underlying rate-limit check.
 */
export async function checkAuthRateLimit(ip: string, action: string) {
  return rateLimit(getRateLimitKey(ip, action), AUTH_CONFIG);
}

const API_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60 * 1000,
};

/**
 * Checks rate limit for an API request. Returns a 429 response if the client
 * has exceeded the limit, or `null` if the request is allowed.
 *
 * @param request  The incoming NextRequest (used to extract client IP).
 * @param action   A label identifying the rate-limited action (e.g. `"tasks:list"`).
 * @param config   Optional override; defaults to 60 requests per 60 seconds.
 */
export async function checkRateLimit(
  request: NextRequest,
  action: string,
  config: RateLimitConfig = API_CONFIG,
): Promise<NextResponse | null> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const { allowed, resetIn } = await rateLimit(getRateLimitKey(ip, action), config);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  return null;
}
