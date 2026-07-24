import { z } from 'zod';

export const sprintOneEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  APP_NAME: z.string().min(1).default('ProfessionalTaskManager'),
  APP_VERSION: z.string().min(1).default('0.1.0'),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  EMAIL_API_URL: z.string().url().optional(),
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof sprintOneEnvSchema>;
export type PublicEnv = Pick<Env, 'NEXT_PUBLIC_APP_URL'>;

const parsed = sprintOneEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
}

const defaultEnv: Env = {
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  APP_NAME: 'ProfessionalTaskManager',
  APP_VERSION: '0.1.0',
  DATABASE_URL: 'postgresql://localhost:5432/ptm',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

export const env: Readonly<Env> = Object.freeze(parsed.data ?? defaultEnv);
export const publicEnv: Readonly<PublicEnv> = Object.freeze({
  NEXT_PUBLIC_APP_URL: parsed.data?.NEXT_PUBLIC_APP_URL ?? defaultEnv.NEXT_PUBLIC_APP_URL,
});
