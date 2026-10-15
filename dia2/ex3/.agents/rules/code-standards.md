# Padrões de codificação

Estas regras se aplicam ao código do frontend e do backend. Os exemplos são ilustrativos e podem ser adaptados às tecnologias do projeto.

## Comentários

Não insira comentários no código. Escreva nomes claros e organize a lógica para que ela possa ser entendida sem explicações extras. Use comentário somente quando for absolutamente necessário, como para esclarecer uma expressão regular complexa que não possa ser tornada evidente por outros meios.

```ts
// Evite comentários que apenas repetem o código:
const total = subtotal + imposto;

// Comentário excepcional: explica a intenção de uma expressão regular complexa.
const padraoDeDocumento = /^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;
```

## Tamanho de arquivos e classes

Nunca crie classes ou arquivos TypeScript (`.ts` ou `.tsx`) com mais de 100 linhas. Divida responsabilidades em arquivos menores, com nomes que indiquem seu propósito.

```text
// Evite: um arquivo de serviço com mais de 100 linhas e várias responsabilidades.
// Prefira separar, por exemplo:
src/services/usuario-service.ts
src/services/validacao-de-usuario.ts
src/repositories/usuario-repository.ts
```

## Tamanho de métodos e funções

Cada método ou função deve ter no máximo 30 linhas. Se o comportamento exigir mais, extraia etapas coesas para funções ou métodos menores, com nomes descritivos.

```ts
function cadastrarUsuario(entrada: EntradaUsuario): Usuario {
  validarEntrada(entrada);
  const usuario = criarUsuario(entrada);
  salvarUsuario(usuario);
  return usuario;
}
```

## Condicionais e cláusulas guarda

Não aninhe mais de três níveis de `if`/`else`. Prefira cláusulas guarda, como `return` antecipado, para tratar casos inválidos ou excepcionais antes do fluxo principal.

```ts
function obterNome(usuario?: Usuario): string {
  if (!usuario) return "Visitante";
  if (!usuario.ativo) return "Conta inativa";

  return usuario.nome;
}
```

## Número de parâmetros

Evite mais de três parâmetros em métodos e funções. Quando forem necessários mais dados, agrupe-os em um objeto parâmetro com propriedades nomeadas.

```ts
type OpcoesDeBusca = {
  termo: string;
  pagina: number;
  limite: number;
  ordenarPor: string;
};

function buscarProdutos(opcoes: OpcoesDeBusca): Produto[] {
  return consultarProdutos(opcoes);
}
```

## Linhas em branco dentro de funções

Evite linhas em branco dentro de métodos e funções. Linhas em branco entre membros de classes ou entre funções no arquivo são permitidas.

```ts
function calcularTotal(itens: Item[]): number {
  const subtotal = somarItens(itens);
  const imposto = calcularImposto(subtotal);
  return subtotal + imposto;
}
```

## Valores mágicos

Extraia números e strings com significado para constantes nomeadas. Isso deixa explícito o conceito e facilita alterações futuras. Não é necessário extrair valores sem significado próprio, como o índice `0` ao acessar o primeiro elemento de uma lista.

```ts
const LIMITE_DE_TENTATIVAS = 3;
const MENSAGEM_DE_SESSAO_EXPIRADA = "Sua sessão expirou";

if (tentativas >= LIMITE_DE_TENTATIVAS) {
  exibirMensagem(MENSAGEM_DE_SESSAO_EXPIRADA);
}
```

## Declaração de variáveis

Declare cada variável perto do ponto em que ela será utilizada. Evite antecipar declarações ou manter variáveis por longos trechos sem uso.

```ts
function exibirResumo(pedido: Pedido): void {
  validarPedido(pedido);
  const total = calcularTotal(pedido.itens);
  mostrarTotal(total);
}
```

## Dados sensíveis

Nunca inclua dados sensíveis, como chaves de API, senhas ou tokens, diretamente no código. Armazene-os em um arquivo `.env` externo e leia-os por meio de variáveis de ambiente. Não versione o arquivo `.env` com valores reais; mantenha um `.env.example` apenas com os nomes das variáveis e valores fictícios ou vazios.

```ts
const chaveDaApi = process.env.API_KEY;

if (!chaveDaApi) {
  throw new Error("A variável API_KEY não foi configurada");
}
```

```dotenv
# .env.example
API_KEY=
```
