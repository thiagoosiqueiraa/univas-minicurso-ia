import type { Lancamento } from './lancamento';

export type ResumoMensal = {
  receitasCentavos: number;
  despesasCentavos: number;
  saldoCentavos: number;
};

export type ConsultaMensal = { mes: string; lancamentos: Lancamento[]; resumo: ResumoMensal };
