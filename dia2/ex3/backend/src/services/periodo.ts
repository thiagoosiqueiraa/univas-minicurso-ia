export function diasNoMes(ano: number, mes: number): number {
  if (mes === 2) {
    const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
    return bissexto ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(mes) ? 30 : 31;
}

export function mesValido(mes: unknown): mes is string {
  if (typeof mes !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) return false;
  return Number(mes.slice(0, 4)) >= 1;
}

export function dataValida(data: unknown): data is string {
  if (typeof data !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(data)) return false;
  if (!mesValido(data.slice(0, 7))) return false;
  const dia = Number(data.slice(8));
  return dia >= 1 && dia <= diasNoMes(Number(data.slice(0, 4)), Number(data.slice(5, 7)));
}

export function limitesDoMes(mes: string): { inicio: string; fim: string } {
  const ultimoDia = diasNoMes(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)));
  return { inicio: `${mes}-01`, fim: `${mes}-${String(ultimoDia).padStart(2, '0')}` };
}
