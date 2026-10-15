import { FormEvent } from 'react';
import { NovoLancamento, TipoLancamento } from '../types/lancamento';

type FormularioProps = { ocupado: boolean; aoSalvar: (dados: NovoLancamento) => Promise<void> };

export function Formulario({ ocupado, aoSalvar }: FormularioProps) {
  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);
    const tipo = campos.get('tipo') as TipoLancamento;
    await aoSalvar({ tipo, descricao: String(campos.get('descricao')).trim(), valor: Number(campos.get('valor')), categoria: String(campos.get('categoria')).trim(), data: String(campos.get('data')) });
    formulario.reset();
    (formulario.elements.namedItem('data') as HTMLInputElement).value = new Date().toISOString().slice(0, 10);
  }

  return <form className="formulario" onSubmit={(evento) => void enviar(evento)}>
    <label>Tipo<select name="tipo" defaultValue="despesa"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label>
    <label>Descrição<input name="descricao" placeholder="Ex.: mercado" required maxLength={100} /></label>
    <label>Valor (R$)<input name="valor" type="number" min="0.01" step="0.01" placeholder="0,00" required /></label>
    <label>Categoria<input name="categoria" placeholder="Ex.: alimentação" required maxLength={60} /></label>
    <label>Data<input name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
    <button className="botao" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Adicionar lançamento'}</button>
  </form>;
}
