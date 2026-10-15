import { CATEGORIAS } from './categorias';
import { dataValida } from './periodo';
import { valorParaCentavos } from './valor-centavos';
import { ApiError } from '../types/api-error';
import type { EntradaLancamento, TipoLancamento } from '../types/entrada-lancamento';

const campos = ['tipo', 'descricao', 'valor', 'categoria', 'data'];

function objetoDeEntrada(entrada: unknown): Record<string, unknown> {
  if (entrada === null || typeof entrada !== 'object' || Array.isArray(entrada)) {
    throw new ApiError('DADOS_INVALIDOS', 400, 'Confira os dados do lançamento.');
  }
  return Object.fromEntries(Object.entries(entrada));
}

export function validarLancamento(entrada: unknown): EntradaLancamento {
  const dados = objetoDeEntrada(entrada);
  const fields: Record<string, string> = {};
  for (const campo of Object.keys(dados)) {
    if (!campos.includes(campo)) fields[campo] = 'Campo não permitido.';
  }
  if (dados.tipo !== 'receita' && dados.tipo !== 'despesa') fields.tipo = 'Selecione receita ou despesa.';
  const descricao = typeof dados.descricao === 'string' ? dados.descricao.trim() : '';
  if (!descricao) fields.descricao = 'Informe uma descrição.';
  else if (descricao.length > 200) fields.descricao = 'Use até 200 caracteres.';
  const valorCentavos = valorParaCentavos(dados.valor);
  if (valorCentavos === null) fields.valor = 'Informe um valor positivo com até duas casas decimais.';
  if (typeof dados.categoria !== 'string' || !CATEGORIAS.includes(dados.categoria as typeof CATEGORIAS[number])) {
    fields.categoria = 'Selecione uma categoria válida.';
  }
  if (!dataValida(dados.data)) fields.data = 'Informe uma data válida.';
  if (Object.keys(fields).length || valorCentavos === null) {
    throw new ApiError('DADOS_INVALIDOS', 400, 'Confira os dados do lançamento.', fields);
  }
  return {
    tipo: dados.tipo as TipoLancamento, descricao, valorCentavos,
    categoria: dados.categoria as string, data: dados.data as string,
  };
}
