import { CATEGORIAS } from './categorias'
import type { CriarLancamentoRequest, ErrosFormulario } from '../types/lancamento'

const FORMATO_VALOR = /^(?:\d+)(?:[.,]\d{1,2})?$/
const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/

export function validarFormulario(entrada: CriarLancamentoRequest): ErrosFormulario {
  const erros: ErrosFormulario = {}
  if (entrada.descricao.trim().length === 0 || entrada.descricao.trim().length > 200) erros.descricao = 'Informe uma descrição com até 200 caracteres.'
  if (!FORMATO_VALOR.test(entrada.valor.trim()) || Number(entrada.valor.replace(',', '.')) <= 0 || !Number.isSafeInteger(Math.round(Number(entrada.valor.replace(',', '.')) * 100))) erros.valor = 'Informe um valor positivo com até duas casas decimais.'
  if (!CATEGORIAS.some((categoria) => categoria === entrada.categoria)) erros.categoria = 'Selecione uma categoria válida.'
  if (!dataCivilValida(entrada.data)) erros.data = 'Informe uma data válida.'
  if (!['receita', 'despesa'].includes(entrada.tipo)) erros.tipo = 'Selecione o tipo do lançamento.'
  return erros
}

export function dataCivilValida(data: string): boolean {
  const partes = FORMATO_DATA.exec(data)
  if (!partes) return false
  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  return ano > 0 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

export function criarRequest(entrada: CriarLancamentoRequest): CriarLancamentoRequest {
  return { ...entrada, descricao: entrada.descricao.trim(), valor: entrada.valor.trim().replace(',', '.') }
}

export function formatarMoeda(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export function dataAtualLocal(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}
