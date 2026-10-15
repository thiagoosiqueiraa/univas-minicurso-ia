import { useCallback, useEffect, useState } from 'react';
import { buscarMes, criarLancamento } from '../services/lancamentos';
import { NovoLancamento, RespostaMes } from '../types/lancamento';

const agora = new Date();
const MES_ATUAL = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
const VAZIO: RespostaMes = { lancamentos: [], resumo: { receitas: 0, despesas: 0, saldo: 0 } };

export function useFinanceiro() {
  const [mes, setMes] = useState(MES_ATUAL);
  const [dados, setDados] = useState<RespostaMes>(VAZIO);
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const atualizar = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try { setDados(await buscarMes(mes)); setAviso(''); } catch (erro) { setDados(VAZIO); setAviso(erro instanceof Error ? erro.message : 'Erro ao carregar lançamentos.'); } finally { setCarregando(false); }
  }, [mes]);
  useEffect(() => { void atualizar(); }, [atualizar]);
  async function salvar(lancamento: NovoLancamento): Promise<void> {
    setSalvando(true);
    try { await criarLancamento(lancamento); setAviso('Lançamento adicionado com sucesso.'); await atualizar(); } catch (erro) { setAviso(erro instanceof Error ? erro.message : 'Não foi possível salvar o lançamento.'); } finally { setSalvando(false); }
  }
  return { mes, setMes, dados, aviso, carregando, salvando, salvar };
}
