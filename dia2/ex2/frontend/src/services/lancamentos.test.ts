import { afterEach, describe, expect, it, vi } from 'vitest';
import { buscarMes, criarLancamento } from './lancamentos';

afterEach(() => vi.unstubAllGlobals());

describe('serviço de lançamentos', () => {
  it('consulta lançamentos e resumo do mês selecionado', async () => {
    const resposta = { lancamentos: [], resumo: { receitas: 0, despesas: 0, saldo: 0 } };
    const requisicao = vi.fn().mockResolvedValue(new Response(JSON.stringify(resposta), { status: 200 }));
    vi.stubGlobal('fetch', requisicao);
    await expect(buscarMes('2026-06')).resolves.toEqual(resposta);
    expect(requisicao).toHaveBeenCalledWith('http://localhost:3000/api/lancamentos?mes=2026-06');
  });

  it('mostra a mensagem de validação enviada pela API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: 'O valor deve ser positivo.' }), { status: 400 })));
    await expect(buscarMes('2026-06')).rejects.toThrow('O valor deve ser positivo.');
  });

  it('recusa respostas de mês com estrutura inválida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ lancamentos: 'inválido' }), { status: 200 })));
    await expect(buscarMes('2026-06')).rejects.toThrow('A API retornou dados inválidos.');
  });

  it('envia o lançamento como JSON', async () => {
    const requisicao = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 201 }));
    vi.stubGlobal('fetch', requisicao);
    await criarLancamento({ tipo: 'despesa', descricao: 'Café', valor: 8.5, categoria: 'Alimentação', data: '2026-06-05' });
    expect(requisicao).toHaveBeenCalledWith('http://localhost:3000/api/lancamentos', expect.objectContaining({ method: 'POST', body: expect.stringContaining('"valor":8.5') }));
  });
});
