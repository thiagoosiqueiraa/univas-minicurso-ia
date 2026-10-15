import { describe, expect, it } from 'vitest'
import { criarRequest, dataAtualLocal, formatarData, formatarMoeda, validarFormulario } from './apresentacao'
import { CATEGORIAS } from './categorias'
import { CATEGORIAS as CATEGORIAS_BACKEND } from '../../../backend/src/services/categorias'
import type { CriarLancamentoRequest } from '../types/lancamento'

const entrada: CriarLancamentoRequest = { tipo: 'despesa', descricao: ' Almoço ', valor: '32,50', categoria: 'Alimentação', data: '2024-02-29' }

describe('apresentação de lançamentos', () => {
  it('valida entrada, normaliza decimal e formata reais e datas civis', () => {
    expect(validarFormulario(entrada)).toEqual({})
    expect(criarRequest(entrada)).toMatchObject({ descricao: 'Almoço', valor: '32.50' })
    expect(formatarMoeda(3250).replace('\u00a0', ' ')).toBe('R$ 32,50')
    expect(formatarData('2024-02-29')).toBe('29/02/2024')
    expect(dataAtualLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('rejeita valores inválidos e datas inexistentes', () => {
    expect(validarFormulario({ ...entrada, valor: '0,001', data: '2023-02-29', descricao: ' ' })).toMatchObject({ valor: expect.any(String), data: expect.any(String), descricao: expect.any(String) })
  })
  it('mantém o contrato das categorias alinhado ao backend', () => {
    expect(CATEGORIAS).toEqual(CATEGORIAS_BACKEND)
  })
})
