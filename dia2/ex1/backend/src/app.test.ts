import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { createApp } from './app';
import { openDatabase } from './database';

const folder = mkdtempSync(join(tmpdir(), 'financas-test-'));
const path = join(folder, 'financas.sqlite');
const db = openDatabase(path);
let server: Server;
let base: string;

before(async () => {
  server = createApp(db).listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Servidor indisponível');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  db.close();
  rmSync(folder, { recursive: true, force: true });
});

async function post(body: unknown) {
  return fetch(`${base}/api/lancamentos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
async function month(value: string) {
  const response = await fetch(`${base}/api/lancamentos?mes=${value}`);
  return { status: response.status, body: await response.json() as { lancamentos: unknown[]; resumo: { receitasCentavos: number; despesasCentavos: number; saldoCentavos: number } } };
}

test('valida os dados recebidos pela API', async () => {
  const valid = { tipo: 'receita', descricao: 'Salário', valorCentavos: 10001, categoria: 'Trabalho', data: '2026-10-15' };
  for (const invalid of [
    { ...valid, valorCentavos: 0 }, { ...valid, valorCentavos: 1.5 },
    { ...valid, descricao: ' ' }, { ...valid, categoria: '' },
    { ...valid, tipo: 'outro' }, { ...valid, data: '2026-02-30' },
  ]) assert.equal((await post(invalid)).status, 400);
  assert.equal((await month('2026-13')).status, 400);
});

test('calcula saldo em centavos, separa meses e mantém os dados no arquivo', async () => {
  const baseItem = { descricao: 'Teste', categoria: 'Outros', data: '2026-10-15' };
  assert.equal((await post({ ...baseItem, tipo: 'receita', valorCentavos: 10001 })).status, 201);
  assert.equal((await post({ ...baseItem, tipo: 'despesa', valorCentavos: 30 })).status, 201);
  assert.equal((await post({ ...baseItem, tipo: 'despesa', valorCentavos: 20, data: '2026-11-01' })).status, 201);
  const october = await month('2026-10');
  assert.equal(october.status, 200);
  assert.equal(october.body.lancamentos.length, 2);
  assert.deepEqual(october.body.resumo, { receitasCentavos: 10001, despesasCentavos: 30, saldoCentavos: 9971 });
  assert.deepEqual((await month('2026-12')).body.resumo, { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 });
  assert.deepEqual((await month('2026-12')).body.lancamentos, []);
  const reopened = openDatabase(path);
  try {
    assert.equal(reopened.prepare('SELECT COUNT(*) AS total FROM lancamentos').get()?.total, 3);
  } finally { reopened.close(); }
});
