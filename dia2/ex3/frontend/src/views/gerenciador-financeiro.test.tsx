import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('gerenciador financeiro', () => {
  it('consulta o mês e cadastra sem trocar o período selecionado', async () => {
    const consultar = { mes: '2026-10', lancamentos: [], resumo: { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 } }
    const cadastrar = { id: 3, tipo: 'despesa', descricao: 'Conta', valorCentavos: 1200, categoria: 'Moradia', data: '2026-09-15' }
    const fetchMock = vi.fn((_url: string, init?: { method?: string; body?: string }) => Promise.resolve(init?.method === 'POST' ? new Response(JSON.stringify(cadastrar), { status: 201 }) : new Response(JSON.stringify(consultar), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    expect(await screen.findByText('Nenhum lançamento neste mês.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Conta' } })
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '12,00' } })
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Moradia' } })
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-09-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar lançamento' }))
    expect((await screen.findByRole('status')).textContent).toContain('Lançamento salvo com sucesso.')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock.mock.calls[1][1]?.body).toContain('"valor":"12.00"')
    const mesSelecionado = screen.getByLabelText('Mês consultado')
    expect(mesSelecionado instanceof HTMLInputElement && mesSelecionado.value === '2026-10').toBe(true)
  })
  it('mostra erros de validação sem chamar a API', async () => {
    const consulta = { mes: '2026-10', lancamentos: [], resumo: { receitasCentavos: 0, despesasCentavos: 0, saldoCentavos: 0 } }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(consulta), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await screen.findByText('Nenhum lançamento neste mês.')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar lançamento' }))
    expect(await screen.findByText('Informe uma descrição com até 200 caracteres.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
