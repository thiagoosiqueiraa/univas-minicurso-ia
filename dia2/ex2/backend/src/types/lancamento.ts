export type TipoLancamento = 'receita' | 'despesa';

export type LancamentoInput = {
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
};

export type Lancamento = LancamentoInput & { id: number };

export type ResumoMensal = {
  receitas: number;
  despesas: number;
  saldo: number;
};
