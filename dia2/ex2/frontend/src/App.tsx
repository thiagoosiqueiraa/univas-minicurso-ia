import { Formulario } from './components/Formulario';
import { ListaLancamentos } from './components/ListaLancamentos';
import { Resumo } from './components/Resumo';
import { useFinanceiro } from './hooks/useFinanceiro';
import './index.css';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function App() {
  const financeiro = useFinanceiro();
  const lancamentos = financeiro.dados.lancamentos;
  return <main className="pagina">
    <header className="topo"><div className="marca"><span aria-hidden="true">◈</span> meu<span>saldo</span></div><span className="legenda-topo">Suas finanças, em equilíbrio.</span></header>
    <section className="cabecalho"><div><p className="sobretitulo">VISÃO GERAL</p><h1>Seu dinheiro, sob controle.</h1><p className="introducao">Acompanhe suas entradas e saídas em um só lugar.</p></div><label className="seletor">Mês de referência<input type="month" value={financeiro.mes} onChange={(evento) => financeiro.setMes(evento.target.value)} /></label></section>
    <Resumo valores={financeiro.dados.resumo} formatar={(valor) => moeda.format(valor)} />
    <section className="conteudo">
      <div className="painel"><div className="titulo-painel"><div><p className="sobretitulo">NOVO REGISTRO</p><h2>Adicionar lançamento</h2></div><span className="selo">✳</span></div><Formulario ocupado={financeiro.salvando} aoSalvar={financeiro.salvar} /></div>
      <div className="painel painel-lista"><div className="titulo-painel"><div><p className="sobretitulo">MOVIMENTAÇÕES</p><h2>Lançamentos do mês</h2></div><span className="contador">{lancamentos.length} {lancamentos.length === 1 ? 'registro' : 'registros'}</span></div>
        {financeiro.aviso && <p className="aviso" role="status">{financeiro.aviso}</p>}{financeiro.carregando ? <p className="vazio" role="status">Carregando lançamentos…</p> : <ListaLancamentos lancamentos={lancamentos} formatar={(valor) => moeda.format(valor)} />}
      </div>
    </section>
    <footer>Feito para trazer clareza ao seu dia a dia.</footer>
  </main>;
}

export default App;
