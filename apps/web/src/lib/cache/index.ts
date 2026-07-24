import { env } from '../config/env';

interface CacheEntry {
  data: string;
  expiresAt: number;
}

interface CacheBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
}

class MemoryBackend implements CacheBackend {
  private store = new Map<string, CacheEntry>();
  private timer: ReturnType<typeof setInterval>;

  constructor() {
    this.timer = setInterval(() => this.cleanup(), 60_000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      data: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  destroy(): void {
    clearInterval(this.timer);
    this.store.clear();
  }
}

class RedisBackend implements CacheBackend {
  private url: string;
  private token: string;

  constructor(redisUrl: string) {
    const parsed = new URL(redisUrl);
    this.token = parsed.username;
    this.url = `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, '');
  }

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

  async get(key: string): Promise<string | null> {
    try {
      const result = (await this.send('GET', key)) as string | null;
      return result ?? null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.send('SETEX', key, String(ttlSeconds), value);
  }

  async del(key: string): Promise<void> {
    await this.send('DEL', key);
  }

  async flush(): Promise<void> {
    await this.send('FLUSHDB');
  }
}

function createBackend(): CacheBackend {
  if (env.REDIS_URL) {
    return new RedisBackend(env.REDIS_URL);
  }
  return new MemoryBackend();
}

export class Cache {
  private backend: CacheBackend;
  private namespace: string;

  constructor(namespace = 'app') {
    this.backend = createBackend();
    this.namespace = namespace;
  }

  private prefixed(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.backend.get(this.prefixed(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.backend.set(this.prefixed(key), serialized, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.backend.del(this.prefixed(key));
  }

  async flush(): Promise<void> {
    await this.backend.flush();
  }
}

export { MemoryBackend, RedisBackend };
export type { CacheBackend };
