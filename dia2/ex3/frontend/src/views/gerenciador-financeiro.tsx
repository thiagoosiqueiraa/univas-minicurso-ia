import { useConsultaMensal } from '../hooks/use-consulta-mensal'
import { FormularioLancamento } from '../components/formulario-lancamento'
import { ListaLancamentos } from '../components/lista-lancamentos'
import { ResumoMensal } from '../components/resumo-mensal'

export function GerenciadorFinanceiro() {
  const consulta = useConsultaMensal()
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-8"><Cabecalho mes={consulta.mes} definirMes={consulta.definirMes} />
      {consulta.estado === 'erro' && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{consulta.erro}</p>}
      <ResumoMensal consulta={consulta.estado === 'sucesso' ? consulta.consulta : null} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><section aria-labelledby="lista-titulo" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="lista-titulo" className="text-lg font-semibold">Lançamentos do mês</h2><ListaLancamentos lancamentos={consulta.consulta?.lancamentos ?? []} carregando={consulta.estado === 'carregando'} indisponivel={consulta.estado === 'erro'} /></section>
        <section aria-labelledby="formulario-titulo" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="formulario-titulo" className="mb-5 text-lg font-semibold">Novo lançamento</h2><FormularioLancamento aoSalvar={(data) => { if (data.slice(0, 7) === consulta.mes) consulta.atualizar() }} /></section>
      </div></div>
  </main>
}

type CabecalhoProps = { mes: string; definirMes: (mes: string) => void }

function Cabecalho({ mes, definirMes }: CabecalhoProps) {
  return <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Finanças pessoais</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Seu mês, em equilíbrio.</h1><p className="mt-2 text-slate-500">Acompanhe suas entradas e saídas com clareza.</p></div>
    <div><label htmlFor="mes" className="mb-2 block text-sm font-medium text-slate-700">Mês consultado</label><input id="mes" lang="pt-BR" type="month" value={mes} onChange={(evento) => definirMes(evento.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></div>
  </header>
}
