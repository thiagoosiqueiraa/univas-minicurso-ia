# Regras de JavaScript e TypeScript

Estas regras se aplicam ao código JavaScript e TypeScript do frontend e do backend. Siga também os [padrões gerais](./code-standards.md) e, conforme a área, as regras de [Node.js](./node.md) e [React](./react.md).

## Declaração de variáveis

Prefira `const` sempre que a variável não precisar receber outro valor. Use `let` somente quando a reatribuição fizer parte do fluxo. Nunca use `var`, pois seu escopo e içamento podem causar comportamentos difíceis de prever.

```ts
const nome = "Ana";
let tentativas = 0;
tentativas += 1;
```

## Comparações

Use comparação estrita: `===` para igualdade e `!==` para diferença. Nunca use `==` ou `!=`; a comparação estrita evita conversões implícitas de tipo.

```ts
if (usuario.id === idBuscado) {
  selecionarUsuario(usuario);
}

if (resposta.status !== 200) {
  lançarErroDeResposta(resposta);
}
```

## Tipos explícitos e seguros

Nunca use `any`, nem como anotação nem como forma de contornar um erro de tipos. Prefira tipos específicos. Para dados de formato desconhecido, use `unknown` e valide ou refine o valor antes de utilizá-lo.

```ts
function obterMensagem(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return "Ocorreu um erro desconhecido";
}
```

Evite asserções de tipo (`as`) sem validação. Ao receber dados externos, como JSON ou valores de formulário, valide o formato antes de tratá-los como um tipo conhecido.

## Tipagem de parâmetros e retornos

Declare os tipos dos parâmetros e do retorno em funções que recebem ou retornam objetos. Crie tipos ou interfaces com nomes descritivos para representar esses formatos. Para funções públicas e funções de serviço, declare também explicitamente os tipos dos parâmetros e do retorno, mesmo quando o TypeScript conseguir inferi-los.

```ts
type Produto = {
  id: string;
  nome: string;
  preco: number;
};

type ResumoProduto = {
  rotulo: string;
  precoFormatado: string;
};

function resumirProduto(produto: Produto): ResumoProduto {
  return {
    rotulo: produto.nome,
    precoFormatado: produto.preco.toFixed(2),
  };
}
```

Prefira `type` ou `interface` a objetos anônimos repetidos. Use `void` para indicar explicitamente que uma função não retorna um valor relevante.

## Funções e callbacks

Prefira declarações de função para as funções principais exportadas pelo arquivo. Use arrow functions em callbacks e funções curtas passadas a métodos como `map`, `filter`, `reduce` e `sort`.

```ts
function listarNomes(produtos: Produto[]): string[] {
  return produtos.map((produto) => produto.nome);
}

const total = produtos.reduce((soma, produto) => soma + produto.preco, 0);
```

Quando um callback manipular um objeto ou tiver uma interface que não seja óbvia, tipifique seus parâmetros. Evite callbacks longos: extraia a lógica para uma função nomeada.

## Condicionais e ternários

Use o operador ternário apenas para uma escolha simples entre dois valores. Nunca aninhe ternários. Para mais de duas possibilidades ou lógica com efeitos colaterais, use `if`/`else` ou uma função dedicada.

```ts
const mensagem = carregando ? "Carregando" : "Pronto";

function obterSituacao(ativo: boolean, suspenso: boolean): string {
  if (suspenso) return "Suspenso";
  if (ativo) return "Ativo";
  return "Inativo";
}
```

Não use atribuições condicionais compactas, como `condicao && (valor = novoValor)`. Prefira uma condicional explícita, que deixa a alteração de estado clara.

```ts
if (deveAtualizar) {
  valor = novoValor;
}
```

## Imutabilidade e valores padrão

Prefira criar novos arrays e objetos com `map`, `filter`, `reduce` e spread quando isso deixar a transformação mais clara. Evite alterar dados recebidos como parâmetros ou estado compartilhado. Use valores padrão com `??` quando apenas `null` e `undefined` devam ativar o padrão; use `||` somente quando valores falsy, como `0` e `""`, também devam ativá-lo.

```ts
const nomeExibido = usuario.apelido ?? usuario.nome;
const produtosAtivos = produtos.filter((produto) => produto.ativo);
```

## Verificação com linter

Ao terminar uma tarefa que crie ou altere código, execute o linter de cada aplicação afetada e corrija os problemas encontrados. Os comandos devem ser executados dentro da pasta da aplicação:

```bash
cd frontend && npm run lint
cd backend && npm run lint
```

Se a aplicação não tiver um script de lint configurado, informe essa limitação e use a verificação estática disponível no projeto, como o build ou o typecheck, quando aplicável.
