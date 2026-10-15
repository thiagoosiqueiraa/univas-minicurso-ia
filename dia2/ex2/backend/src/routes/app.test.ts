import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pasta = mkdtempSync(join(tmpdir(), 'financas-'));
process.env.DATABASE_PATH = join(pasta, 'teste.sqlite');
let app: (typeof import('./app'))['app'];
let banco: (typeof import('../data/database'))['banco'];

beforeAll(async () => {
  app = (await import('./app')).app;
  banco = (await import('../data/database')).banco;
});
afterAll(() => { banco.close(); rmSync(pasta, { recursive: true, force: true }); });

describe('API de lançamentos', () => {
  it('valida campos obrigatórios e valor positivo', async () => {
    const resposta = await request(app).post('/api/lancamentos').send({ tipo: 'despesa', valor: 0 });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toContain('descrição');
  });

  it('persiste receitas e despesas e calcula o saldo apenas do mês consultado', async () => {
    await request(app).post('/api/lancamentos').send({ tipo: 'receita', descricao: 'Salário', valor: 3250.10, categoria: 'Trabalho', data: '2026-06-05' }).expect(201);
    await request(app).post('/api/lancamentos').send({ tipo: 'despesa', descricao: 'Aluguel', valor: 1200.35, categoria: 'Casa', data: '2026-06-08' }).expect(201);
    await request(app).post('/api/lancamentos').send({ tipo: 'receita', descricao: 'Outro mês', valor: 500, categoria: 'Extra', data: '2026-05-31' }).expect(201);
    const resposta = await request(app).get('/api/lancamentos?mes=2026-06').expect(200);
    expect(resposta.body.lancamentos).toHaveLength(2);
    expect(resposta.body.resumo).toEqual({ receitas: 3250.1, despesas: 1200.35, saldo: 2049.75 });
  });

  it('retorna lista vazia, saldo zero e rejeita mês inválido', async () => {
    const vazio = await request(app).get('/api/lancamentos?mes=2026-07').expect(200);
    expect(vazio.body).toEqual({ lancamentos: [], resumo: { receitas: 0, despesas: 0, saldo: 0 } });
    await request(app).get('/api/lancamentos?mes=2026-13').expect(400);
  });
});
