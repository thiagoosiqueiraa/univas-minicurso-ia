import express from 'express';
import cors from 'cors';
import type { DatabaseSync } from 'node:sqlite';
import { getMonth, insertTransaction, type Transaction } from './database';

const validMonth = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validate(body: unknown): { value?: Omit<Transaction, 'id'>; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Informe os dados do lançamento.' };
  const input = body as Record<string, unknown>;
  if (input.tipo !== 'receita' && input.tipo !== 'despesa') return { error: 'Escolha receita ou despesa.' };
  if (typeof input.descricao !== 'string' || !input.descricao.trim() || input.descricao.trim().length > 120) return { error: 'Informe uma descrição de até 120 caracteres.' };
  if (typeof input.categoria !== 'string' || !input.categoria.trim() || input.categoria.trim().length > 60) return { error: 'Informe uma categoria de até 60 caracteres.' };
  if (!Number.isSafeInteger(input.valorCentavos) || (input.valorCentavos as number) <= 0) return { error: 'Informe um valor positivo em centavos.' };
  if (!validDate(input.data)) return { error: 'Informe uma data válida.' };
  return { value: {
    tipo: input.tipo,
    descricao: input.descricao.trim(),
    categoria: input.categoria.trim(),
    valorCentavos: input.valorCentavos as number,
    data: input.data,
  } };
}

export function createApp(db: DatabaseSync) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => { res.json({ status: 'healthy' }); });
  app.get('/api/lancamentos', (req, res) => {
    if (!validMonth(req.query.mes)) {
      res.status(400).json({ erro: 'Informe um mês válido no formato AAAA-MM.' });
      return;
    }
    res.json(getMonth(db, req.query.mes));
  });
  app.post('/api/lancamentos', (req, res) => {
    const parsed = validate(req.body);
    if (!parsed.value) {
      res.status(400).json({ erro: parsed.error });
      return;
    }
    res.status(201).json(insertTransaction(db, parsed.value));
  });
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if ('status' in err && err.status === 400) {
      res.status(400).json({ erro: 'Dados JSON inválidos.' });
      return;
    }
    console.error(err);
    res.status(500).json({ erro: 'Não foi possível concluir a operação.' });
  });
  return app;
}
