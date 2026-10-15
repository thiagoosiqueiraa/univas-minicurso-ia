import { Lancamento, NovoLancamento, RespostaMes } from '../types/lancamento';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function isLancamento(valor: unknown): valor is Lancamento {
  if (typeof valor !== 'object' || valor === null) return false;
  return 'id' in valor && typeof valor.id === 'number' && 'tipo' in valor && (valor.tipo === 'receita' || valor.tipo === 'despesa') && 'descricao' in valor && typeof valor.descricao === 'string' && 'valor' in valor && typeof valor.valor === 'number' && 'categoria' in valor && typeof valor.categoria === 'string' && 'data' in valor && typeof valor.data === 'string';
}

function isRespostaMes(dados: unknown): dados is RespostaMes {
  if (typeof dados !== 'object' || dados === null || !('lancamentos' in dados) || !Array.isArray(dados.lancamentos) || !dados.lancamentos.every(isLancamento) || !('resumo' in dados) || typeof dados.resumo !== 'object' || dados.resumo === null) return false;
  return 'receitas' in dados.resumo && typeof dados.resumo.receitas === 'number' && 'despesas' in dados.resumo && typeof dados.resumo.despesas === 'number' && 'saldo' in dados.resumo && typeof dados.resumo.saldo === 'number';
}

async function lerErro(resposta: Response): Promise<string> {
  const dados: unknown = await resposta.json();
  return typeof dados === 'object' && dados !== null && 'erro' in dados && typeof dados.erro === 'string' ? dados.erro : 'Não foi possível comunicar com a API.';
}

export async function buscarMes(mes: string): Promise<RespostaMes> {
  const resposta = await fetch(`${API}/api/lancamentos?mes=${encodeURIComponent(mes)}`);
  if (!resposta.ok) throw new Error(await lerErro(resposta));
  const dados: unknown = await resposta.json();
  if (!isRespostaMes(dados)) throw new Error('A API retornou dados inválidos.');
  return dados;
}

export async function criarLancamento(dados: NovoLancamento): Promise<void> {
  const resposta = await fetch(`${API}/api/lancamentos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
  if (!resposta.ok) throw new Error(await lerErro(resposta));
}
