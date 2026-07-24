import { env } from './env';

export type AppConfig = Readonly<{
  name: string;
  version: string;
  url: string;
  environment: 'development' | 'test' | 'production';
}>;

export const app: AppConfig = Object.freeze({
  name: env.APP_NAME,
  version: env.APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
  environment: env.NODE_ENV,
});
