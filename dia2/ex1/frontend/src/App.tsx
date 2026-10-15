import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Plus, Wallet } from 'lucide-react'

type Tipo = 'receita' | 'despesa'
type Lancamento = { id: number; tipo: Tipo; descricao: string; valorCentavos: number; categoria: string; data: string }
type MesResponse = { mes: string; lancamentos: Lancamento[]; resumo: { receitasCentavos: number; despesasCentavos: number; saldoCentavos: number } }
type Message = { kind: 'success' | 'error'; text: string } | null

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const money = (cents: number) => {
  const absolute = Math.abs(cents)
  const whole = Math.floor(absolute / 100)
  const fraction = String(absolute % 100).padStart(2, '0')
  return `${cents < 0 ? '−' : ''}R$ ${new Intl.NumberFormat('pt-BR').format(whole)},${fraction}`
}
const longMonth = (month: string) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`))
const displayDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
const emptySummary = { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 }

function parseCents(value: string): number | null {
  const clean = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null
  const [whole, fraction = ''] = clean.split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

async function api<T>(path: string, options?: { method?: string; headers?: Record<string, string>; body?: string; signal?: AbortSignal }): Promise<T> {
  const response = await fetch(path, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.')
  return data as T
}

function App() {
  const [month, setMonth] = useState(today().slice(0, 7))
  const [data, setData] = useState<MesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message>(null)
  const [saving, setSaving] = useState(false)
  const [tipo, setTipo] = useState<Tipo>('despesa')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [date, setDate] = useState(today())

  const load = useCallback(async (selected: string, signal?: AbortSignal) => {
    setLoading(true)
    setData(null)
    try {
      const result = await api<MesResponse>(`/api/lancamentos?mes=${encodeURIComponent(selected)}`, { signal })
      if (!signal?.aborted) setData(result)
      return true
    } catch (error) {
      if (!signal?.aborted) { setData(null); setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Não foi possível carregar os lançamentos.' }) }
      return false
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [])

  useEffect(() => { const controller = new AbortController(); void load(month, controller.signal); return () => controller.abort() }, [month, load])

  const shiftMonth = (offset: number) => {
    const [year, number] = month.split('-').map(Number)
    const next = new Date(year, number - 1 + offset, 1)
    setMessage(null)
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const cents = parseCents(valor)
    if (!descricao.trim() || !categoria.trim() || !date || cents === null) { setMessage({ kind: 'error', text: 'Preencha todos os campos e informe um valor positivo com até duas casas decimais.' }); return }
    setSaving(true); setMessage(null)
    try {
      await api<Lancamento>('/api/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo, descricao: descricao.trim(), valorCentavos: cents, categoria: categoria.trim(), data: date }) })
      setDescricao(''); setValor(''); setCategoria('')
      const entryMonth = date.slice(0, 7)
      if (entryMonth === month) {
        if (await load(month)) setMessage({ kind: 'success', text: 'Lançamento salvo com sucesso.' })
      } else {
        setMonth(entryMonth)
        setMessage({ kind: 'success', text: 'Lançamento salvo com sucesso.' })
      }
    } catch (error) { setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Não foi possível salvar o lançamento.' }) }
    finally { setSaving(false) }
  }

  const summary = data?.resumo ?? emptySummary
  const entries = data?.lancamentos ?? []
  return <div className="app-shell"><div className="layout">
    <header className="topbar"><div className="brand"><div className="brand-icon"><Wallet size={21} strokeWidth={2.2} /></div><span>claro<span className="brand-dot">.</span></span></div><div className="topbar-label">SEU ESPAÇO FINANCEIRO</div></header>
    <main><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> VISÃO GERAL</div><h1>Suas finanças, <em>em ordem.</em></h1><p>Registre o que entra e sai. O resto fica mais claro.</p></div><div className="month-picker" aria-label="Mês consultado"><button type="button" aria-label="Mês anterior" onClick={() => shiftMonth(-1)}><ChevronLeft size={19} /></button><div className="month-value"><CalendarDays size={16} /><span>{longMonth(month)}</span><input type="month" aria-label="Selecionar mês" title="Selecionar mês" value={month} onChange={event => { if (event.target.value) { setMessage(null); setMonth(event.target.value) } }} /></div><button type="button" aria-label="Próximo mês" onClick={() => shiftMonth(1)}><ChevronRight size={19} /></button></div></section>
    <section className="summary-grid" aria-label="Resumo financeiro"><article className="summary-card balance-card"><div className="summary-top"><span>SALDO DO MÊS</span><span className="summary-icon balance-icon"><Wallet size={19} /></span></div><strong>{money(summary.saldoCentavos)}</strong><p>Receitas menos despesas</p><div className="balance-decoration" /></article><article className="summary-card"><div className="summary-top"><span>RECEITAS</span><span className="summary-icon income-icon"><ArrowDownLeft size={19} /></span></div><strong>{money(summary.receitasCentavos)}</strong><p>Total recebido no mês</p></article><article className="summary-card"><div className="summary-top"><span>DESPESAS</span><span className="summary-icon expense-icon"><ArrowUpRight size={19} /></span></div><strong>{money(summary.despesasCentavos)}</strong><p>Total gasto no mês</p></article></section>
    {message && <div className={`notice ${message.kind}`} role="alert">{message.text}</div>}
    <div className="content-grid"><section className="panel entries-panel"><div className="panel-heading"><div><div className="section-kicker">MOVIMENTAÇÕES</div><h2>Lançamentos</h2></div><span className="entry-count">{entries.length} {entries.length === 1 ? 'registro' : 'registros'}</span></div>{loading ? <div className="empty-state">Carregando lançamentos...</div> : message?.kind === 'error' && !data ? <div className="empty-state">Não foi possível carregar os lançamentos.</div> : entries.length === 0 ? <div className="empty-state"><div className="empty-icon"><Wallet size={25} /></div><h3>Nenhum lançamento por aqui</h3><p>Adicione uma receita ou despesa para começar a acompanhar este mês.</p></div> : <div className="entry-list">{entries.map(entry => <article className="entry" key={entry.id}><div className={`entry-icon ${entry.tipo}`} aria-hidden="true">{entry.tipo === 'receita' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}</div><div className="entry-main"><strong>{entry.descricao}</strong><div className="entry-meta"><span>{entry.categoria}</span><span className="meta-dot">·</span><span>{displayDate(entry.data)}</span></div></div><div className={`entry-value ${entry.tipo}`}>{entry.tipo === 'receita' ? '+' : '−'} {money(entry.valorCentavos)}</div></article>)}</div>}</section>
    <section className="panel form-panel"><div className="form-heading"><div><div className="section-kicker">NOVO REGISTRO</div><h2>Adicionar lançamento</h2></div><span className="form-plus"><Plus size={18} /></span></div><form onSubmit={submit} noValidate><label className="field-label">Tipo de lançamento</label><div className="type-switch" role="group" aria-label="Tipo de lançamento"><button type="button" className={tipo === 'despesa' ? 'active expense-active' : ''} onClick={() => setTipo('despesa')}>Despesa</button><button type="button" className={tipo === 'receita' ? 'active income-active' : ''} onClick={() => setTipo('receita')}>Receita</button></div><label className="field-label" htmlFor="description">Descrição</label><input id="description" value={descricao} onChange={event => setDescricao(event.target.value)} placeholder="Ex.: Conta de luz" maxLength={120} required /><div className="form-row"><div><label className="field-label" htmlFor="value">Valor (R$)</label><input id="value" type="text" inputMode="decimal" value={valor} onChange={event => setValor(event.target.value)} placeholder="0,00" required /></div><div><label className="field-label" htmlFor="date">Data</label><input id="date" type="date" value={date} onChange={event => setDate(event.target.value)} required /></div></div><label className="field-label" htmlFor="category">Categoria</label><input id="category" value={categoria} onChange={event => setCategoria(event.target.value)} placeholder="Ex.: Moradia" maxLength={60} list="categories" required /><datalist id="categories"><option value="Alimentação" /><option value="Moradia" /><option value="Transporte" /><option value="Saúde" /><option value="Lazer" /><option value="Salário" /><option value="Outros" /></datalist><button className="submit-button" type="submit" disabled={saving}><Plus size={19} />{saving ? 'Salvando...' : 'Adicionar lançamento'}</button></form></section></div></main><footer>CLARO FINANÇAS <span>•</span> SIMPLES ASSIM</footer>
  </div></div>
}

export default App
