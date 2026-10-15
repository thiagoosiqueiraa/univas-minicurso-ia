import 'dotenv/config';
import { createServer, type Server } from 'node:http';
import { createApp } from './app';
import { readConfig, type Config } from './config';
import { openDatabase, type AppDatabase } from './data/database';
import { SqliteLancamentosRepository } from './data/lancamentos-repository';
import { logger } from './logger';

type RunningServer = { server: Server; database: AppDatabase };

export async function startServer(config: Config): Promise<RunningServer> {
  const database = await openDatabase(config.databasePath);
  const app = createApp(new SqliteLancamentosRepository(database), config.frontendOrigin);
  const server = createServer(app);
  try {
    await new Promise<void>((resolve, reject) => {
      function onError(error: Error): void {
        server.off('listening', onListening);
        reject(error);
      }
      function onListening(): void {
        server.off('error', onError);
        resolve();
      }
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(config.port, '127.0.0.1');
    });
  } catch (error) {
    await database.close();
    throw error;
  }
  logger.info('Servidor iniciado');
  return { server, database };
}

export async function stopServer(running: RunningServer): Promise<void> {
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  try {
    await new Promise<void>((resolve, reject) => {
      running.server.close((error) => error ? reject(error) : resolve());
    });
  } finally {
    try {
      await running.database.close();
      logger.info('Servidor encerrado');
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function main(): Promise<void> {
  const running = await startServer(readConfig());
  let closing = false;
  async function shutdown(): Promise<void> {
    if (closing) return;
    closing = true;
    logger.info('Encerrando servidor');
    await stopServer(running);
  }
  process.once('SIGINT', () => void shutdown().catch(fail));
  process.once('SIGTERM', () => void shutdown().catch(fail));
}

function fail(): void {
  logger.error('Falha na inicialização');
  process.exitCode = 1;
}

if (require.main === module) void main().catch(fail);
