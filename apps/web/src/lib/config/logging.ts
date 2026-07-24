import { env } from './env';

export type LoggingConfig = Readonly<{
  level: 'debug' | 'info' | 'warn' | 'error';
}>;

export const logging: LoggingConfig = Object.freeze({
  level: env.LOG_LEVEL,
});
