# Regras de Node.js

Estas regras se aplicam ao backend Node.js. Siga também os padrões gerais de [codificação](./code-standards.md) e de [testes](./tests.md).

## Operações assíncronas

Prefira `async`/`await` a callbacks para operações assíncronas. Trate erros com `try`/`catch` quando for possível recuperá-los ou acrescentar contexto; caso contrário, propague-os para o tratamento central de erros.

```ts
async function buscarUsuario(id: string): Promise<Usuario> {
  const resposta = await repositorio.encontrarPorId(id);
  if (!resposta) throw new Error("Usuário não encontrado");
  return resposta;
}
```

Não bloqueie o event loop com operações síncronas de I/O em caminhos de requisição. Prefira APIs assíncronas, como `fs.promises`, e evite variantes síncronas como `readFileSync` no servidor.

```ts
import { readFile } from "node:fs/promises";

const configuracao = await readFile("config.json", "utf8");
```

Evite também cálculos pesados ou loops longos na thread principal, pois eles impedem o atendimento de outras requisições. Divida o trabalho em etapas assíncronas quando apropriado ou mova cálculos que consomem CPU para `worker_threads` ou um processo separado.

## Variáveis de ambiente

Configure variáveis de ambiente em `.env` e carregue-as com a biblioteca `dotenv`. Mantenha `.env` fora do controle de versão e forneça `.env.example` sem segredos para documentar as variáveis necessárias. Valide as configurações na inicialização, antes de iniciar o servidor.

```ts
import "dotenv/config";

const porta = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(porta) || porta < 1) {
  throw new Error("PORT deve ser um número inteiro positivo");
}
```

```dotenv
# .env.example
PORT=3000
DATABASE_URL=
```

## Encerramento gracioso do servidor

Ao receber sinais de encerramento, pare de aceitar novas conexões e aguarde as requisições em andamento antes de finalizar. Feche também recursos mantidos pela aplicação, como conexões com banco de dados. Defina um limite de espera para que uma conexão travada não impeça o processo de sair.

```ts
const servidor = app.listen(porta);
let encerrando = false;

async function encerrar(signal: string): Promise<void> {
  if (encerrando) return;
  encerrando = true;
  logger.info(`Sinal ${signal} recebido; encerrando servidor`);
  const limite = setTimeout(() => process.exit(1), 10_000);
  limite.unref();
  servidor.close(async (erro) => {
    if (erro) {
      logger.error("Falha ao fechar o servidor", erro);
      process.exitCode = 1;
    }
    await fecharConexoes();
    clearTimeout(limite);
  });
}

process.on("SIGTERM", () => void encerrar("SIGTERM"));
process.on("SIGINT", () => void encerrar("SIGINT"));
```

Adapte o fechamento de recursos às dependências reais do serviço. Não encerre o processo antes de concluir o fechamento normal.

## Logging centralizado

Use `console.log` para mensagens informativas e `console.error` para erros somente por meio de um adaptador centralizado. Módulos da aplicação devem chamar o adaptador, não os métodos `console` diretamente. Isso mantém formato e contexto consistentes e permite trocar o destino do log em um único lugar.

```ts
export const logger = {
  info(mensagem: string): void {
    console.log(`[INFO] ${mensagem}`);
  },
  error(mensagem: string, erro?: unknown): void {
    console.error(`[ERROR] ${mensagem}`, erro);
  },
};
```

```ts
logger.info(`Servidor iniciado na porta ${porta}`);
logger.error("Não foi possível carregar o usuário", erro);
```

Não registre senhas, tokens, chaves ou outros dados sensíveis.

## Arquivos de dependências

Versione os arquivos de lock, como `package-lock.json`, junto das mudanças em dependências. Eles garantem instalações reproduzíveis; use `npm ci` para instalar exatamente as versões registradas em um projeto que usa npm.

## Dependências entre módulos

Evite referências circulares entre módulos. Dependências em ciclo dificultam a inicialização e podem expor valores ainda não inicializados. Extraia tipos ou funções compartilhadas para um módulo de menor nível, ou reorganize as responsabilidades para que as dependências sigam uma única direção.

```text
# Evite: a -> b -> a
# Prefira: a -> comum <- b
```
