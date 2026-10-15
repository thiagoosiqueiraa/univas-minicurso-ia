import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { startServer, stopServer } from './index';
import { logger } from './logger';

const directories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('ciclo de vida do servidor', () => {
  it('inicia após abrir o banco e encerra sem perder os dados', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'financeiro-start-'));
    directories.push(directory);
    const config = { port: 0, databasePath: join(directory, 'financeiro.sqlite'), frontendOrigin: 'http://localhost:5173' };
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const running = await startServer(config);
    try {
      const health = await request(running.server).get('/health');
      expect(health.status).toBe(200);
      expect(info).toHaveBeenCalledWith('Servidor iniciado');
    } finally {
      await stopServer(running);
    }
    expect(running.server.listening).toBe(false);
    expect(info).toHaveBeenCalledWith('Servidor encerrado');
  });
});
