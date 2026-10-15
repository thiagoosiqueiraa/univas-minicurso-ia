import type { AppDatabase } from './database';
import type { EntradaLancamento } from '../types/entrada-lancamento';
import type { Lancamento } from '../types/lancamento';
import { ApiError } from '../types/api-error';

export interface LancamentosRepository {
  inserir(entrada: EntradaLancamento): Promise<Lancamento>;
  listarEntre(inicio: string, fim: string): Promise<Lancamento[]>;
  verificarSaude(): Promise<void>;
}

type Row = { id: number; tipo: 'receita' | 'despesa'; descricao: string; valor_centavos: number; categoria: string; data: string };

function fromRow(row: Row): Lancamento {
  if (!Number.isSafeInteger(row.id) || !Number.isSafeInteger(row.valor_centavos)) {
    throw new Error('Inteiro do banco fora da faixa segura');
  }
  return {
    id: row.id, tipo: row.tipo, descricao: row.descricao,
    valorCentavos: row.valor_centavos, categoria: row.categoria, data: row.data,
  };
}

async function databaseCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('BANCO_INDISPONIVEL', 503, 'O serviço está temporariamente indisponível.');
  }
}

export class SqliteLancamentosRepository implements LancamentosRepository {
  constructor(private readonly database: AppDatabase) {}

  async inserir(entrada: EntradaLancamento): Promise<Lancamento> {
    return databaseCall(async () => {
      const result = await this.database.run(
        'INSERT INTO lancamentos (tipo, descricao, valor_centavos, categoria, data) VALUES (?, ?, ?, ?, ?)',
        entrada.tipo, entrada.descricao, entrada.valorCentavos, entrada.categoria, entrada.data,
      );
      const id = result.lastID;
      if (id === undefined || !Number.isSafeInteger(id)) throw new Error('ID inválido');
      return { id, ...entrada };
    });
  }

  async listarEntre(inicio: string, fim: string): Promise<Lancamento[]> {
    return databaseCall(async () => {
      const rows = await this.database.all<Row[]>(
        'SELECT * FROM lancamentos WHERE data >= ? AND data <= ? ORDER BY data DESC, id DESC', inicio, fim,
      );
      return rows.map(fromRow);
    });
  }

  async verificarSaude(): Promise<void> {
    await databaseCall(async () => { await this.database.get('SELECT 1'); });
  }
}
