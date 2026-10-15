import type { LancamentosRepository } from '../data/lancamentos-repository';
import type { Lancamento } from '../types/lancamento';
import type { ConsultaMensal } from '../types/consulta-mensal';
import { ApiError } from '../types/api-error';
import { validarLancamento } from './validar-lancamento';
import { mesValido, limitesDoMes } from './periodo';
import { calcularResumo } from './resumo-mensal';

export function criarLancamentosService(repository: LancamentosRepository) {
  return {
    async criar(entrada: unknown): Promise<Lancamento> {
      return repository.inserir(validarLancamento(entrada));
    },
    async consultar(mes: unknown): Promise<ConsultaMensal> {
      if (!mesValido(mes)) throw new ApiError('MES_INVALIDO', 400, 'Selecione um mês válido.');
      const { inicio, fim } = limitesDoMes(mes);
      const lancamentos = await repository.listarEntre(inicio, fim);
      return { mes, lancamentos, resumo: calcularResumo(lancamentos) };
    },
    async verificarSaude(): Promise<void> {
      await repository.verificarSaude();
    },
  };
}
