import { describe, expect, it } from 'vitest';
import { calcularResumo } from './resumo-mensal';
import type { Lancamento } from '../types/lancamento';

const lancamento = (tipo: 'receita' | 'despesa', valorCentavos: number): Lancamento => ({
  id: 1, tipo, valorCentavos, descricao: 'Teste', categoria: 'Outros', data: '2026-10-15',
});

describe('calcularResumo', () => {
  it('soma receitas, despesas e saldo em centavos', () => {
    expect(calcularResumo([lancamento('receita', 1010), lancamento('receita', 20), lancamento('despesa', 305)]))
      .toEqual({ receitasCentavos: 1030, despesasCentavos: 305, saldoCentavos: 725 });
  });
  it('retorna zeros para lista vazia', () => {
    expect(calcularResumo([])).toEqual({ receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 });
  });
  it('falha em soma fora da faixa segura', () => {
    expect(() => calcularResumo([lancamento('receita', Number.MAX_SAFE_INTEGER), lancamento('receita', 1)]))
      .toThrow('Total fora da faixa segura');
  });
});
