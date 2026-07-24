import { env } from './env';

export type DatabaseConfig = Readonly<{
  url: string;
}>;

export const database: DatabaseConfig = Object.freeze({
  url: env.DATABASE_URL,
});
