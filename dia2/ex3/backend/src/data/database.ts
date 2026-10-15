import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

const schema = `
  CREATE TABLE IF NOT EXISTS lancamentos (
    id INTEGER PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
    categoria TEXT NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_lancamentos_data_id ON lancamentos (data DESC, id DESC);
`;

export async function openDatabase(path: string): Promise<AppDatabase> {
  await mkdir(dirname(path), { recursive: true });
  const database = await open({ filename: path, driver: sqlite3.Database });
  try {
    await database.exec(schema);
    return database;
  } catch (error) {
    await database.close();
    throw error;
  }
}
