import { env } from '@/lib/config/env';

export const appConfig = {
  name: env.APP_NAME,
  version: env.APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
};

export type AppConfig = typeof appConfig;
