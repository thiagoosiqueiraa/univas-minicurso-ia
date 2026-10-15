export type TipoLancamento = 'receita' | 'despesa';
export type Lancamento = { id: number; tipo: TipoLancamento; descricao: string; valor: number; categoria: string; data: string };
export type NovoLancamento = Omit<Lancamento, 'id'>;
export type RespostaMes = { lancamentos: Lancamento[]; resumo: { receitas: number; despesas: number; saldo: number } };
