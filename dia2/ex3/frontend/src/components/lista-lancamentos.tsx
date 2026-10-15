import { formatarData, formatarMoeda } from '../services/apresentacao'
import type { Lancamento } from '../types/lancamento'

type ListaLancamentosProps = { lancamentos: Lancamento[]; carregando: boolean; indisponivel?: boolean }

export function ListaLancamentos({ lancamentos, carregando, indisponivel = false }: ListaLancamentosProps) {
  if (carregando) return <p role="status" className="p-6 text-center text-slate-500">Carregando lançamentos…</p>
  if (indisponivel) return <p className="p-6 text-center text-slate-500">A lista ficará disponível quando a consulta for concluída.</p>
  if (lancamentos.length === 0) return <p className="p-6 text-center text-slate-500">Nenhum lançamento neste mês.</p>
  return <ul className="divide-y divide-slate-100">{lancamentos.map((item) => <ItemLancamento key={item.id} item={item} />)}</ul>
}

type ItemLancamentoProps = { item: Lancamento }

function ItemLancamento({ item }: ItemLancamentoProps) {
  const receita = item.tipo === 'receita'
  return <li className="flex flex-wrap items-center justify-between gap-3 py-4">
    <div><p className="font-medium text-slate-900">{item.descricao}</p><p className="mt-1 text-sm text-slate-500">{item.categoria} · {formatarData(item.data)}</p></div>
    <p className={`font-semibold ${receita ? 'text-emerald-700' : 'text-rose-700'}`}>{receita ? '+' : '−'}{formatarMoeda(item.valorCentavos)}</p>
  </li>
}
