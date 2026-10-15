import { describe, expect, it } from 'vitest';
import { dataValida, limitesDoMes, mesValido } from './periodo';

describe('período civil', () => {
  it.each(['2024-02-29', '2000-02-29', '0001-01-01', '9999-12-31'])('aceita %s', (data) => {
    expect(dataValida(data)).toBe(true);
  });
  it.each(['1900-02-29', '2026-02-30', '2026-04-31', '0000-01-01', '2026-13-01', '2026-01-00', '2026-1-01', 123])(
    'recusa %s', (data) => { expect(dataValida(data)).toBe(false); },
  );
  it.each(['2026-02', '0001-01', '9999-12'])('aceita mês %s', (mes) => {
    expect(mesValido(mes)).toBe(true);
  });
  it.each(['0000-01', '2026-00', '2026-13', '2026-1', '', 202601])('recusa mês %s', (mes) => {
    expect(mesValido(mes)).toBe(false);
  });
  it('calcula os limites de fevereiro bissexto', () => {
    expect(limitesDoMes('2024-02')).toEqual({ inicio: '2024-02-01', fim: '2024-02-29' });
  });
});
