import { Lancamento } from '../types/lancamento';

type ListaProps = { lancamentos: Lancamento[]; formatar: (valor: number) => string };

function dataLocal(data: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${data}T00:00:00Z`));
}

export function ListaLancamentos({ lancamentos, formatar }: ListaProps) {
  if (lancamentos.length === 0) return <div className="vazio"><span aria-hidden="true">◌</span><strong>Nenhum lançamento neste mês</strong><p>Adicione uma receita ou despesa para começar.</p></div>;
  return <ul className="lista">{lancamentos.map((item) => <li className="item" key={item.id}>
    <span className={`icone ${item.tipo}`} aria-hidden="true">{item.tipo === 'receita' ? '↙' : '↗'}</span>
    <span className="detalhe"><strong>{item.descricao}</strong><small>{item.categoria} · {dataLocal(item.data)}</small></span>
    <strong className={`valor ${item.tipo}`}>{item.tipo === 'receita' ? '+' : '−'} {formatar(item.valor)}</strong>
  </li>)}</ul>;
}
