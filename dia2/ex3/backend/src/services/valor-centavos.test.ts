import { describe, expect, it } from 'vitest';
import { valorParaCentavos } from './valor-centavos';

describe('valorParaCentavos', () => {
  it.each([['10.10', 1010], ['0.20', 20], ['3.05', 305], ['123', 12300], ['90071992547409.91', Number.MAX_SAFE_INTEGER]])(
    'converte %s em %i centavos', (valor, centavos) => {
      expect(valorParaCentavos(valor)).toBe(centavos);
    },
  );
  it.each(['0', '-1', '1.234', '1e3', '1.', '.5', '01', '90071992547409.92', '', 10])(
    'recusa valor inválido %s', (valor) => {
      expect(valorParaCentavos(valor)).toBeNull();
    },
  );
});
