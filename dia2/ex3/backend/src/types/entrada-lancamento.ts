export type TipoLancamento = 'receita' | 'despesa';

export type EntradaLancamento = {
  tipo: TipoLancamento;
  descricao: string;
  valorCentavos: number;
  categoria: string;
  data: string;
};
