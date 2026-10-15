import { resolve } from 'node:path';

export type Config = { port: number; databasePath: string; frontendOrigin: string };

export function readConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const port = Number(env.PORT ?? '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser uma porta válida');
  }
  const databasePath = env.DATABASE_PATH ?? 'data/financeiro.sqlite';
  if (!databasePath.trim()) throw new Error('DATABASE_PATH deve ser informado');
  const frontendOrigin = env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  try {
    const url = new URL(frontendOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== frontendOrigin) {
      throw new Error('Origem inválida');
    }
  } catch {
    throw new Error('FRONTEND_ORIGIN deve ser uma origem HTTP válida');
  }
  return { port, databasePath: resolve(databasePath), frontendOrigin };
}
