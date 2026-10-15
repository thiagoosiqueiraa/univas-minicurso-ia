# Regras de React

Estas regras se aplicam ao frontend React em `frontend/`. Siga também os padrões gerais de [codificação](./code-standards.md) e de [testes](./tests.md).

## Componentes pequenos e funcionais

Prefira componentes funcionais, pequenos e reutilizáveis. Um componente deve ter no máximo **30 linhas**; extraia partes coesas para outros componentes ou hooks quando ultrapassar esse limite. Dê nomes que indiquem a responsabilidade de cada componente.

```tsx
type AvisoProps = {
  mensagem: string;
};

export function Aviso({ mensagem }: AvisoProps) {
  return (
    <p role="status" aria-live="polite" className="rounded bg-blue-50 p-3 text-blue-900">
      {mensagem}
    </p>
  );
}
```

## Props explícitas

Não encaminhe props arbitrárias a elementos JSX com o operador spread, como `<button {...props} />`. Declare e passe explicitamente as propriedades necessárias. Isso mantém clara a interface do componente e evita encaminhar atributos ou eventos inesperados ao DOM.

```tsx
type BotaoSalvarProps = {
  rotulo: string;
  desabilitado?: boolean;
  aoSalvar: () => void;
};

export function BotaoSalvar({ rotulo, desabilitado = false, aoSalvar }: BotaoSalvarProps) {
  return (
    <button type="button" disabled={desabilitado} onClick={aoSalvar}>
      {rotulo}
    </button>
  );
}
```

## Hooks e efeitos

Use hooks personalizados com nomes iniciados por `use` para manter lógica reutilizável ou não visual separada do componente. Deixe o componente focado em apresentar dados e conectar ações da interface.

Evite `useEffect` quando o valor puder ser calculado durante a renderização, quando a ação puder ocorrer diretamente em um evento, ou quando uma chave de `key` resolver a redefinição de estado. Reserve efeitos para sincronizar o React com sistemas externos, como uma assinatura ou uma API imperativa.

```tsx
function useFiltroDeProdutos(produtos: Produto[], termo: string) {
  return produtos.filter((produto) =>
    produto.nome.toLocaleLowerCase().includes(termo.toLocaleLowerCase()),
  );
}

function ListaDeProdutos({ produtos, termo }: ListaProps) {
  const produtosFiltrados = useFiltroDeProdutos(produtos, termo);
  return <ul>{produtosFiltrados.map((produto) => <ItemProduto key={produto.id} produto={produto} />)}</ul>;
}
```

## Cálculos e memoização

Use `useMemo` para evitar repetir cálculos realmente pesados entre renderizações. Inclua todas as dependências usadas no cálculo e não use memoização para operações simples, pois ela também tem custo.

```tsx
const resumo = useMemo(() => gerarResumoCompleto(registros), [registros]);
```

## Acesso ao backend

Mantenha chamadas HTTP e detalhes de acesso ao backend fora do corpo do componente. Coloque essa responsabilidade em módulos de serviço e, quando fizer sentido, exponha o estado e as ações por um hook `use...`. O componente deve consumir dados e ações já preparados para a interface.

```ts
export async function buscarPerfil(): Promise<Perfil> {
  const resposta = await fetch(`${import.meta.env.VITE_API_URL}/perfil`);
  if (!resposta.ok) throw new Error("Não foi possível carregar o perfil");
  return resposta.json() as Promise<Perfil>;
}
```

```tsx
function PerfilDaPessoa() {
  const { perfil, carregando } = usePerfil();
  if (carregando) return <p role="status" aria-live="polite">Carregando perfil…</p>;
  return <h1>{perfil.nome}</h1>;
}
```

## Acessibilidade

Use elementos HTML semânticos e atributos `aria-*` apropriados para que controles e estados tenham nomes e informações acessíveis. Associe rótulos a campos, identifique regiões e informe estados dinâmicos quando necessário. Não adicione papéis ARIA que contradigam a semântica nativa do elemento.

```tsx
<label htmlFor="busca">Buscar produtos</label>
<input id="busca" type="search" aria-describedby="dica-busca" />
<p id="dica-busca" className="text-sm text-slate-600">
  Digite o nome do produto.
</p>
<button type="button" aria-label="Limpar busca" onClick={limparBusca}>
  Limpar
</button>
```

## Estilização

Estilize os componentes com classes utilitárias do Tailwind. Prefira manter as classes junto ao elemento que estilizam e reutilize componentes quando um padrão visual se repetir.

```tsx
<section className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow">
  <h2 className="text-xl font-semibold text-slate-900">Seus pedidos</h2>
</section>
```
