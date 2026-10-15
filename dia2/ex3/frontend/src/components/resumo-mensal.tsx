import { formatarMoeda } from '../services/apresentacao'
import type { ConsultaMensal } from '../types/lancamento'

type ResumoMensalProps = { consulta: ConsultaMensal | null }

export function ResumoMensal({ consulta }: ResumoMensalProps) {
  const resumo = consulta?.resumo ?? null
  return <section aria-label="Resumo do mês" className="grid gap-3 sm:grid-cols-3">
    <Cartao titulo="Receitas" valor={resumo?.receitasCentavos ?? null} cor="text-emerald-700" />
    <Cartao titulo="Despesas" valor={resumo?.despesasCentavos ?? null} cor="text-rose-700" />
    <Cartao titulo="Saldo do mês" valor={resumo?.saldoCentavos ?? null} cor="text-slate-900" />
  </section>
}

type CartaoProps = { titulo: string; valor: number | null; cor: string }

function Cartao({ titulo, valor, cor }: CartaoProps) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{titulo}</p>
    <p className={`mt-2 text-2xl font-semibold tracking-tight ${cor}`}>{valor === null ? '—' : formatarMoeda(valor)}</p>
  </article>
}
