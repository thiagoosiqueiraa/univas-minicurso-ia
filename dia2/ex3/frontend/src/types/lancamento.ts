export type TipoLancamento = 'receita' | 'despesa'

export type CriarLancamentoRequest = {
  tipo: TipoLancamento
  descricao: string
  valor: string
  categoria: string
  data: string
}

export type Lancamento = Omit<CriarLancamentoRequest, 'valor'> & {
  id: number
  valorCentavos: number
}

export type ResumoMensal = {
  receitasCentavos: number
  despesasCentavos: number
  saldoCentavos: number
}

export type ConsultaMensal = {
  mes: string
  lancamentos: Lancamento[]
  resumo: ResumoMensal
}

export type ErrosFormulario = Partial<Record<keyof CriarLancamentoRequest, string>>
