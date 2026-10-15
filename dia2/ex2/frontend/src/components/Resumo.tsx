type ResumoProps = { valores: { receitas: number; despesas: number; saldo: number }; formatar: (valor: number) => string };

export function Resumo({ valores, formatar }: ResumoProps) {
  return <section className="resumo" aria-label="Resumo financeiro">
    <article className="cartao resumo-receita"><span>Receitas</span><strong>{formatar(valores.receitas)}</strong><small>Entradas no mês</small></article>
    <article className="cartao resumo-despesa"><span>Despesas</span><strong>{formatar(valores.despesas)}</strong><small>Saídas no mês</small></article>
    <article className="cartao resumo-saldo"><span>Saldo do mês</span><strong>{formatar(valores.saldo)}</strong><small>Receitas menos despesas</small></article>
  </section>;
}
