import { useState, type FormEvent } from 'react'
import { CATEGORIAS } from '../services/categorias'
import { criarRequest, dataAtualLocal, validarFormulario } from '../services/apresentacao'
import { criarLancamento, ErroApi } from '../services/lancamentos-api'
import type { CriarLancamentoRequest, ErrosFormulario } from '../types/lancamento'

type FormularioProps = { aoSalvar: (data: string) => void }
const FORMULARIO_INICIAL: CriarLancamentoRequest = { tipo: 'despesa', descricao: '', valor: '', categoria: '', data: dataAtualLocal() }

export function FormularioLancamento({ aoSalvar }: FormularioProps) {
  const [entrada, definirEntrada] = useState(FORMULARIO_INICIAL)
  const [erros, definirErros] = useState<ErrosFormulario>({})
  const [mensagem, definirMensagem] = useState('')
  const [enviando, definirEnviando] = useState(false)
  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    const validacao = validarFormulario(entrada)
    definirErros(validacao)
    definirMensagem('')
    if (Object.keys(validacao).length > 0) return
    await salvar()
  }
  async function salvar(): Promise<void> {
    definirEnviando(true)
    try {
      const request = criarRequest(entrada)
      await criarLancamento(request)
      definirMensagem('Lançamento salvo com sucesso.')
      definirEntrada({ ...FORMULARIO_INICIAL, data: entrada.data })
      aoSalvar(entrada.data)
    } catch (falha: unknown) {
      definirErros(falha instanceof ErroApi ? errosDaApi(falha.fields) : {})
      definirMensagem(falha instanceof Error ? falha.message : 'Não foi possível salvar o lançamento.')
    } finally {
      definirEnviando(false)
    }
  }
  return <form onSubmit={enviar} noValidate className="space-y-4">
    <CampoTipo entrada={entrada} atualizar={definirEntrada} erros={erros} />
    <CampoTexto entrada={entrada} atualizar={definirEntrada} erros={erros} />
    <div className="grid gap-4 sm:grid-cols-2"><CampoCategoria entrada={entrada} atualizar={definirEntrada} erros={erros} /><CampoData entrada={entrada} atualizar={definirEntrada} erros={erros} /></div>
    {mensagem && <p role="status" aria-live="polite" className="text-sm text-slate-700">{mensagem}</p>}
    <button disabled={enviando} className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60">{enviando ? 'Salvando…' : 'Salvar lançamento'}</button>
  </form>
}

function errosDaApi(campos?: Record<string, string>): ErrosFormulario {
  const chaves = ['tipo', 'descricao', 'valor', 'categoria', 'data'] as const
  return Object.fromEntries(chaves.filter((chave) => campos?.[chave]).map((chave) => [chave, campos?.[chave]]))
}

type CampoProps = { entrada: CriarLancamentoRequest; atualizar: (entrada: CriarLancamentoRequest) => void; erros: ErrosFormulario }
function alterar(campo: keyof CriarLancamentoRequest, valor: string, props: CampoProps): void {
  props.atualizar({ ...props.entrada, [campo]: valor })
}

function CampoTipo(props: CampoProps) {
  return <fieldset><legend className="mb-2 text-sm font-medium text-slate-700">Tipo</legend><div className="grid grid-cols-2 gap-2">
    {(['despesa', 'receita'] as const).map((tipo) => <label key={tipo} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm"><input type="radio" name="tipo" value={tipo} checked={props.entrada.tipo === tipo} onChange={() => alterar('tipo', tipo, props)} />{tipo === 'receita' ? 'Receita' : 'Despesa'}</label>)}
  </div></fieldset>
}

function CampoTexto(props: CampoProps) {
  return <div className="grid gap-4 sm:grid-cols-2"><CampoInput id="descricao" label="Descrição" value={props.entrada.descricao} error={props.erros.descricao} onChange={(valor) => alterar('descricao', valor, props)} /><CampoInput id="valor" label="Valor (R$)" value={props.entrada.valor} error={props.erros.valor} onChange={(valor) => alterar('valor', valor, props)} inputMode="decimal" /></div>
}

type InputProps = { id: 'descricao' | 'valor' | 'data'; label: string; value: string; error?: string; inputMode?: 'decimal'; onChange: (valor: string) => void }
function CampoInput({ id, label, value, error, inputMode, onChange }: InputProps) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">{label}</label><input id={id} lang={id === 'data' ? 'pt-BR' : undefined} required value={value} inputMode={inputMode} type={id === 'data' ? 'date' : 'text'} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-erro` : undefined} onChange={(evento) => onChange(evento.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />{error && <p id={`${id}-erro`} className="mt-1 text-sm text-rose-700">{error}</p>}</div>
}

function CampoCategoria(props: CampoProps) {
  return <div><label htmlFor="categoria" className="mb-2 block text-sm font-medium text-slate-700">Categoria</label><select id="categoria" required value={props.entrada.categoria} aria-invalid={Boolean(props.erros.categoria)} onChange={(evento) => alterar('categoria', evento.target.value, props)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="">Selecione</option>{CATEGORIAS.map((categoria) => <option key={categoria}>{categoria}</option>)}</select>{props.erros.categoria && <p className="mt-1 text-sm text-rose-700">{props.erros.categoria}</p>}</div>
}

function CampoData(props: CampoProps) {
  return <CampoInput id="data" label="Data" value={props.entrada.data} error={props.erros.data} onChange={(valor) => alterar('data', valor, props)} />
}
