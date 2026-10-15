import type { Lancamento } from '../types/lancamento';
import type { ResumoMensal } from '../types/consulta-mensal';

function somarSeguro(atual: number, valor: number): number {
  const total = atual + valor;
  if (!Number.isSafeInteger(atual) || !Number.isSafeInteger(valor) || !Number.isSafeInteger(total)) {
    throw new Error('Total fora da faixa segura');
  }
  return total;
}

export function calcularResumo(lancamentos: Lancamento[]): ResumoMensal {
  let receitasCentavos = 0;
  let despesasCentavos = 0;
  for (const lancamento of lancamentos) {
    if (lancamento.tipo === 'receita') {
      receitasCentavos = somarSeguro(receitasCentavos, lancamento.valorCentavos);
    } else {
      despesasCentavos = somarSeguro(despesasCentavos, lancamento.valorCentavos);
    }
  }
  const saldoCentavos = somarSeguro(receitasCentavos, -despesasCentavos);
  return { receitasCentavos, despesasCentavos, saldoCentavos };
}
