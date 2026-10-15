const MAX_CENTAVOS = BigInt(Number.MAX_SAFE_INTEGER);

export function valorParaCentavos(valor: unknown): number | null {
  if (typeof valor !== 'string' || !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(valor)) return null;
  const [inteiros, decimais = ''] = valor.split('.');
  const centavos = BigInt(inteiros) * 100n + BigInt(decimais.padEnd(2, '0'));
  if (centavos < 1n || centavos > MAX_CENTAVOS) return null;
  return Number(centavos);
}
