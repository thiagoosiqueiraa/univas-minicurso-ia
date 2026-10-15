import { criarLancamento, listarPorMes, resumirMes } from '../data/lancamento-repository';
import { LancamentoInput } from '../types/lancamento';

const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;
const MES_VALIDO = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validarLancamento(entrada: unknown): LancamentoInput {
  if (typeof entrada !== 'object' || entrada === null) throw new Error('Informe os dados do lançamento.');
  const dados = entrada as Record<string, unknown>;
  if (dados.tipo !== 'receita' && dados.tipo !== 'despesa') throw new Error('Selecione receita ou despesa.');
  if (typeof dados.descricao !== 'string' || !dados.descricao.trim()) throw new Error('Informe a descrição.');
  if (typeof dados.valor !== 'number' || !Number.isFinite(dados.valor) || dados.valor <= 0 || Math.round(dados.valor * 100) <= 0) throw new Error('O valor deve ser positivo e ter até duas casas decimais.');
  if (!Number.isFinite(dados.valor * 100) || Math.abs(dados.valor * 100 - Math.round(dados.valor * 100)) > 1e-7) throw new Error('O valor deve ter até duas casas decimais.');
  if (typeof dados.categoria !== 'string' || !dados.categoria.trim()) throw new Error('Informe a categoria.');
  if (typeof dados.data !== 'string' || !DATA_VALIDA.test(dados.data) || Number.isNaN(Date.parse(`${dados.data}T00:00:00Z`)) || new Date(`${dados.data}T00:00:00Z`).toISOString().slice(0, 10) !== dados.data) throw new Error('Informe uma data válida.');
  return { tipo: dados.tipo, descricao: dados.descricao.trim(), valor: dados.valor, categoria: dados.categoria.trim(), data: dados.data };
}

export function validarMes(mes: unknown): string {
  if (typeof mes !== 'string' || !MES_VALIDO.test(mes)) throw new Error('Informe o mês no formato AAAA-MM.');
  return mes;
}

export function salvarLancamento(entrada: unknown) {
  return criarLancamento(validarLancamento(entrada));
}

export function consultarMes(mes: unknown) {
  const valido = validarMes(mes);
  return { lancamentos: listarPorMes(valido), resumo: resumirMes(valido) };
}
