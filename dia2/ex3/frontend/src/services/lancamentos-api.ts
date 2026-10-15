import type { ConsultaMensal, CriarLancamentoRequest, Lancamento } from '../types/lancamento'
import { dataCivilValida } from './apresentacao'
import { CATEGORIAS } from './categorias'

const TEMPO_LIMITE_MS = 10_000
const URL_API = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
type OpcoesRequisicao = { method: 'GET' | 'POST'; signal?: AbortSignal; headers?: Record<string, string>; body?: string }

export class ErroApi extends Error {
  constructor(message: string, readonly fields?: Record<string, string>) {
    super(message)
  }
}

export async function consultarMes(mes: string, signal?: AbortSignal): Promise<ConsultaMensal> {
  const resposta = await requisitar(`/api/lancamentos?mes=${encodeURIComponent(mes)}`, { method: 'GET', signal })
  const dados: unknown = await resposta.json()
  if (!consultaValida(dados, mes)) throw new ErroApi('A API retornou uma consulta inválida.')
  return dados
}

export async function criarLancamento(entrada: CriarLancamentoRequest): Promise<Lancamento> {
  const resposta = await requisitar('/api/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entrada) })
  const dados: unknown = await resposta.json()
  if (!lancamentoValido(dados)) throw new ErroApi('A API retornou um lançamento inválido.')
  return dados
}

async function requisitar(caminho: string, init: OpcoesRequisicao): Promise<Response> {
  const controlador = new AbortController()
  const limite = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS)
  const cancelar = () => controlador.abort()
  init.signal?.addEventListener('abort', cancelar, { once: true })
  try {
    const resposta = await fetch(`${URL_API}${caminho}`, { ...init, signal: controlador.signal })
    if (!resposta.ok) throw await erroDaResposta(resposta)
    return resposta
  } catch (erro: unknown) {
    if (erro instanceof ErroApi) throw erro
    if (erro instanceof DOMException && erro.name === 'AbortError') throw new ErroApi('A solicitação demorou demais. Tente novamente.')
    throw new ErroApi('Não foi possível conectar ao serviço. Tente novamente.')
  } finally {
    clearTimeout(limite)
    init.signal?.removeEventListener('abort', cancelar)
  }
}

async function erroDaResposta(resposta: Response): Promise<ErroApi> {
  try {
    const dados: unknown = await resposta.json()
    if (objeto(dados) && objeto(dados.error)) return new ErroApi(texto(dados.error.message) ?? 'Não foi possível concluir a operação.', campos(dados.error.fields))
  } catch {
    return new ErroApi('Não foi possível concluir a operação. Tente novamente.')
  }
  return new ErroApi('Não foi possível concluir a operação. Tente novamente.')
}

function consultaValida(valor: unknown, mes: string): valor is ConsultaMensal {
  if (!objeto(valor) || valor.mes !== mes || !Array.isArray(valor.lancamentos) || !objeto(valor.resumo)) return false
  const resumo = valor.resumo
  return inteiro(resumo.receitasCentavos) && inteiro(resumo.despesasCentavos) && Number.isSafeInteger(resumo.saldoCentavos) && valor.lancamentos.every(lancamentoValido)
}

function lancamentoValido(valor: unknown): valor is Lancamento {
  return objeto(valor) && Number.isSafeInteger(valor.id) && typeof valor.id === 'number' && valor.id > 0 && ['receita', 'despesa'].includes(String(valor.tipo)) && descricaoValida(valor.descricao) && inteiroPositivo(valor.valorCentavos) && categoriaValida(valor.categoria) && typeof valor.data === 'string' && dataCivilValida(valor.data)
}

function descricaoValida(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.length <= 200
}

function categoriaValida(valor: unknown): valor is string {
  return typeof valor === 'string' && CATEGORIAS.some((categoria) => categoria === valor)
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function inteiro(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isSafeInteger(valor) && valor >= 0
}

function inteiroPositivo(valor: unknown): valor is number {
  return inteiro(valor) && valor > 0
}

function texto(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined
}

function campos(valor: unknown): Record<string, string> | undefined {
  if (!objeto(valor)) return undefined
  return Object.fromEntries(Object.entries(valor).filter((item): item is [string, string] => typeof item[1] === 'string'))
}
