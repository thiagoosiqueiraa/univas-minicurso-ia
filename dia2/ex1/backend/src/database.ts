import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type Transaction = {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valorCentavos: number;
  categoria: string;
  data: string;
};

export function openDatabase(path = resolve(__dirname, '../data/financas.sqlite')): DatabaseSync {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
      descricao TEXT NOT NULL,
      valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
      categoria TEXT NOT NULL,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data);
  `);
  return db;
}

const columns = 'id, tipo, descricao, valor_centavos AS valorCentavos, categoria, data';

export function insertTransaction(db: DatabaseSync, item: Omit<Transaction, 'id'>): Transaction {
  const result = db.prepare('INSERT INTO lancamentos (tipo, descricao, valor_centavos, categoria, data) VALUES (?, ?, ?, ?, ?)')
    .run(item.tipo, item.descricao, item.valorCentavos, item.categoria, item.data);
  return db.prepare(`SELECT ${columns} FROM lancamentos WHERE id = ?`).get(Number(result.lastInsertRowid)) as Transaction;
}

export function getMonth(db: DatabaseSync, month: string) {
  const start = `${month}-01`;
  const [year, number] = month.split('-').map(Number);
  const end = `${number === 12 ? year + 1 : year}-${String(number === 12 ? 1 : number + 1).padStart(2, '0')}-01`;
  const items = db.prepare(`SELECT ${columns} FROM lancamentos WHERE data >= ? AND data < ? ORDER BY data DESC, id DESC`)
    .all(start, end) as Transaction[];
  const totals = db.prepare(`SELECT
    COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor_centavos ELSE 0 END), 0) AS receitasCentavos,
    COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor_centavos ELSE 0 END), 0) AS despesasCentavos
    FROM lancamentos WHERE data >= ? AND data < ?`).get(start, end) as { receitasCentavos: number; despesasCentavos: number };
  return {
    mes: month,
    lancamentos: items,
    resumo: { ...totals, saldoCentavos: totals.receitasCentavos - totals.despesasCentavos },
  };
}
