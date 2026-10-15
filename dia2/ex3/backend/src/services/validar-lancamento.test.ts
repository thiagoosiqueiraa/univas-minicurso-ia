import { describe, expect, it } from 'vitest';
import { CATEGORIAS } from './categorias';
import { validarLancamento } from './validar-lancamento';
import { ApiError } from '../types/api-error';

const valido = { tipo: 'despesa', descricao: ' Almoço ', valor: '32.50', categoria: 'Alimentação', data: '2026-10-15' };

describe('validarLancamento', () => {
  it('apara descrição e converte valor', () => {
    expect(validarLancamento(valido)).toEqual({ tipo: 'despesa', descricao: 'Almoço', valorCentavos: 3250, categoria: 'Alimentação', data: '2026-10-15' });
  });
  it.each(['receita', 'despesa'])('aceita nove categorias para %s', (tipo) => {
    for (const categoria of CATEGORIAS) {
      expect(validarLancamento({ ...valido, tipo, categoria }).categoria).toBe(categoria);
    }
    expect(CATEGORIAS).toHaveLength(9);
  });
  it('recusa campos inválidos e informa cada campo', () => {
    try {
      validarLancamento({ ...valido, tipo: 'outro', descricao: ' ', valor: '0', categoria: 'Outra', data: '2026-02-30', extra: true });
      throw new Error('Deveria falhar');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).fields).toEqual({ tipo: expect.any(String), descricao: expect.any(String), valor: expect.any(String), categoria: expect.any(String), data: expect.any(String), extra: expect.any(String) });
    }
  });
  it.each([null, [], 5, 'texto'])('recusa corpo não objeto %s', (body) => {
    expect(() => validarLancamento(body)).toThrow(ApiError);
  });
  it('recusa descrição longa', () => {
    expect(() => validarLancamento({ ...valido, descricao: 'x'.repeat(201) })).toThrow(ApiError);
  });
});
