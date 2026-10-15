import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mesAtualLocal, useConsultaMensal } from './use-consulta-mensal'

function resposta(mes: string): Response {
  return new Response(JSON.stringify({ mes, lancamentos: [], resumo: { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 } }), { status: 200 })
}

describe('consulta mensal', () => {
  it('inicia no mês local atual e mantém apenas a resposta do mês atual', async () => {
    let resolverAntigo: ((value: Response) => void) | undefined
    const fetchMock = vi.fn((url: string) => url.endsWith('2026-09') ? new Promise<Response>((resolve) => { resolverAntigo = resolve }) : Promise.resolve(resposta('2026-11')))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useConsultaMensal())
    expect(result.current.mes).toBe(mesAtualLocal())
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    act(() => result.current.definirMes('2026-09'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    act(() => result.current.definirMes('2026-11'))
    await waitFor(() => expect(result.current.estado).toBe('sucesso'))
    await act(async () => { resolverAntigo?.(resposta('2026-09')) })
    expect(result.current.consulta?.mes).toBe('2026-11')
    vi.unstubAllGlobals()
  })
})
