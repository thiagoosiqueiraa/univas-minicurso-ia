import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from './app';
import { openDatabase, type AppDatabase } from './data/database';
import { SqliteLancamentosRepository } from './data/lancamentos-repository';

const entrada = { tipo: 'receita', descricao: ' Serviço ', valor: '10.10', categoria: 'Trabalho extra', data: '2026-10-15' };
let directory: string;
let path: string;
let database: AppDatabase;
let app: Express;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'financeiro-'));
  path = join(directory, 'financeiro.sqlite');
  database = await openDatabase(path);
  app = createApp(new SqliteLancamentosRepository(database), 'http://localhost:5173');
});

afterEach(async () => {
  await database.close().catch(() => undefined);
  await rm(directory, { recursive: true, force: true });
});

describe('API de lançamentos', () => {
  it('persiste um POST válido e encontra o registro após reabrir o arquivo', async () => {
    const response = await request(app).post('/api/lancamentos').send(entrada);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 1, tipo: 'receita', descricao: 'Serviço', valorCentavos: 1010, categoria: 'Trabalho extra', data: '2026-10-15' });
    await database.close();
    database = await openDatabase(path);
    const nextApp = createApp(new SqliteLancamentosRepository(database), 'http://localhost:5173');
    const saved = await request(nextApp).get('/api/lancamentos?mes=2026-10');
    expect(saved.body.lancamentos).toEqual([response.body]);
  });

  it.each([{ ...entrada, valor: '0' }, { ...entrada, data: '2026-02-30' }, { ...entrada, categoria: 'Desconhecida' }, { ...entrada, extra: true }])(
    'recusa POST inválido sem gravar', async (body) => {
      const response = await request(app).post('/api/lancamentos').send(body);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DADOS_INVALIDOS');
      const count = await database.get<{ total: number }>('SELECT COUNT(*) AS total FROM lancamentos');
      expect(count?.total).toBe(0);
    },
  );

  it('recusa JSON malformado e rota desconhecida com envelopes seguros', async () => {
    const malformed = await request(app).post('/api/lancamentos').set('Content-Type', 'application/json').send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error).toEqual({ code: 'DADOS_INVALIDOS', message: 'Confira os dados do lançamento.' });
    const missing = await request(app).get('/inexistente');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NAO_ENCONTRADO');
  });

  it.each(['/api/lancamentos', '/api/lancamentos?mes=2026-13', '/api/lancamentos?mes=2026-10&mes=2026-11'])(
    'recusa período inválido %s', async (url) => {
      const response = await request(app).get(url);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MES_INVALIDO');
    },
  );

  it('filtra mês, ordena por data e id e calcula resumo', async () => {
    await request(app).post('/api/lancamentos').send(entrada);
    await request(app).post('/api/lancamentos').send({ ...entrada, descricao: 'Outro', valor: '0.20' });
    await request(app).post('/api/lancamentos').send({ ...entrada, tipo: 'despesa', descricao: 'Despesa', valor: '3.05', data: '2026-10-16' });
    await request(app).post('/api/lancamentos').send({ ...entrada, data: '2026-09-30' });
    const response = await request(app).get('/api/lancamentos?mes=2026-10');
    expect(response.status).toBe(200);
    expect(response.body.lancamentos.map((item: { id: number }) => item.id)).toEqual([3, 2, 1]);
    expect(response.body.resumo).toEqual({ receitasCentavos: 1030, despesasCentavos: 305, saldoCentavos: 725 });
    const empty = await request(app).get('/api/lancamentos?mes=2026-08');
    expect(empty.body).toEqual({ mes: '2026-08', lancamentos: [], resumo: { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 } });
  });

  it('retorna saúde e CORS para origem configurada', async () => {
    const response = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('retorna 503 quando a conexão fecha e não anuncia sucesso', async () => {
    await database.close();
    const health = await request(app).get('/health');
    const list = await request(app).get('/api/lancamentos?mes=2026-10');
    const create = await request(app).post('/api/lancamentos').send(entrada);
    for (const response of [health, list, create]) {
      expect(response.status).toBe(503);
      expect(response.body.error).toEqual({ code: 'BANCO_INDISPONIVEL', message: 'O serviço está temporariamente indisponível.' });
    }
  });
});
