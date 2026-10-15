import { afterEach, describe, expect, it, vi } from 'vitest'
import { consultarMes, criarLancamento, ErroApi } from './lancamentos-api'

const consulta = { mes: '2026-10', lancamentos: [], resumo: { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 } }
const lancamento = { id: 1, tipo: 'despesa', descricao: 'Almoço', valorCentavos: 3250, categoria: 'Alimentação', data: '2026-10-15' }

afterEach(() => vi.unstubAllGlobals())

describe('cliente HTTP', () => {
  it('consulta e valida contrato de resposta', async () => {
    const buscar = vi.fn().mockResolvedValue(new Response(JSON.stringify(consulta), { status: 200 }))
    vi.stubGlobal('fetch', buscar)
    await expect(consultarMes('2026-10')).resolves.toEqual(consulta)
  })
  it('recusa resposta fora do contrato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
    await expect(consultarMes('2026-10')).rejects.toThrow('consulta inválida')
  })
  it('explica indisponibilidade de rede e erros sem envelope da API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(consultarMes('2026-10')).rejects.toThrow('Não foi possível conectar')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('indisponível', { status: 503 })))
    await expect(consultarMes('2026-10')).rejects.toThrow('Não foi possível concluir')
  })
  it('envia POST uma vez e transforma falhas HTTP em erros úteis', async () => {
    const enviar = vi.fn().mockResolvedValue(new Response(JSON.stringify(lancamento), { status: 201 }))
    vi.stubGlobal('fetch', enviar)
    await expect(criarLancamento({ tipo: 'despesa', descricao: 'Almoço', valor: '32.50', categoria: 'Alimentação', data: '2026-10-15' })).resolves.toEqual(lancamento)
    expect(enviar).toHaveBeenCalledTimes(1)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'Confira os dados.', fields: { valor: 'Valor inválido.' } } }), { status: 400 })))
    await expect(criarLancamento({ tipo: 'despesa', descricao: 'Almoço', valor: '0', categoria: 'Alimentação', data: '2026-10-15' })).rejects.toMatchObject({ fields: { valor: 'Valor inválido.' } } satisfies Partial<ErroApi>)
  })
})
