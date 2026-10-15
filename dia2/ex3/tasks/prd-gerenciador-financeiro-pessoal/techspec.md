# Especificação técnica

## Resumo

A solução acrescenta ao Express uma API para criar lançamentos e consultar, em uma única resposta, os lançamentos e o resumo de um mês. O backend valida a entrada, converte valores decimais em centavos inteiros e persiste os dados em SQLite. A interface React consulta a API, apresenta o formulário e o período selecionado e formata os valores em reais. O [PRD](./prd.md) define o escopo e os critérios de aceitação (CA-01 a CA-09).

O banco fica em arquivo local fora do controle de versão. A API não depende de autenticação nem de serviços externos nesta versão. A consulta e o resumo usam a mesma lista de registros retornada pelo repositório, evitando divergência entre períodos. O frontend descarta respostas de consultas antigas e nunca apresenta dados de outro mês como atuais.

## Arquitetura do sistema

### Visão dos componentes

| Componente | Local | Responsabilidade e relação |
| --- | --- | --- |
| Configuração e inicialização | `backend/src/config.ts`, `backend/src/index.ts` | Validar `PORT`, `DATABASE_PATH` e `FRONTEND_ORIGIN`, abrir banco, criar esquema, iniciar servidor e fechar conexões no encerramento. |
| Aplicação HTTP e erros | `backend/src/app.ts`, `backend/src/routes/error-handler.ts`, `backend/src/logger.ts` | Montar CORS, JSON, `/health` e rotas; normalizar erros e registrar eventos sem dados financeiros. |
| Rotas de lançamentos | `backend/src/routes/lancamentos-routes.ts` | Interpretar `POST`/`GET`, delegar aos serviços e responder com os contratos desta especificação. |
| Regras de lançamentos | `backend/src/services/validar-lancamento.ts`, `backend/src/services/consultar-mes.ts`, `backend/src/services/categorias.ts` | Validar campos e período, converter valor em centavos, calcular totais e saldo. |
| Banco e repositório | `backend/src/data/database.ts`, `backend/src/data/lancamentos-repository.ts` | Criar tabela e índice; inserir e buscar por intervalo de datas com parâmetros vinculados. |
| Tipos do domínio | `backend/src/types/` | Um tipo compartilhado por arquivo: entrada, lançamento, consulta e erro. |
| Cliente da API | `frontend/src/services/lancamentos-api.ts` | Definir URL base, enviar requisições, validar contratos recebidos, aplicar timeout e converter falhas em mensagens da UI. |
| Estado da consulta | `frontend/src/hooks/use-consulta-mensal.ts` | Manter mês selecionado, estado de carregamento, dados e erro; cancelar/ignorar requisições obsoletas. |
| Tela financeira | `frontend/src/App.tsx`, `frontend/src/views/gerenciador-financeiro.tsx` | Substituir a tela de status e compor seletor de mês, resumo, lista, formulário e mensagens. |
| Elementos de interface | `frontend/src/components/` | Componentes pequenos para seletor, cartões de resumo, listagem, formulário e avisos; rótulos e foco acessíveis. |
| Regras de apresentação | `frontend/src/services/validar-formulario.ts`, `frontend/src/services/formatar-valor.ts`, `frontend/src/types/` | Validar antes do envio, transformar entrada monetária em contrato da API, formatar BRL e tipar respostas. |

Fluxo: formulário → validação na UI → `POST /api/lancamentos` → validação no serviço → repositório SQLite → confirmação. Consulta: seletor de mês → `GET /api/lancamentos?mes=AAAA-MM` → repositório → cálculo em centavos → lista e resumo na mesma resposta → apresentação. Um cadastro em mês diferente preserva o mês selecionado; um cadastro no mês visível dispara nova consulta.

## Design de implementação

### Principais interfaces

```text
validarLancamento(entrada: unknown) -> EntradaValidada | ErroDeValidacao
criarLancamento(entrada: EntradaValidada) -> Promise<Lancamento>
consultarMes(mes: string) -> Promise<ConsultaMensal>
repositorio.inserir(entrada: EntradaValidada) -> Promise<Lancamento>
repositorio.listarEntre(inicio: string, fim: string) -> Promise<Lancamento[]>
```

```text
api.criar(entrada: CriarLancamentoRequest, signal?: AbortSignal) -> Promise<Lancamento>
api.consultar(mes: string, signal?: AbortSignal) -> Promise<ConsultaMensal>
useConsultaMensal() -> { mes, definirMes, consulta, estado, erro, atualizar }
```

As interfaces HTTP e de persistência são assíncronas. Rotas não calculam totais; componentes React não fazem `fetch`. Serviços não conhecem `Request`, `Response` nem detalhes do SQLite.

### Modelos de dados

#### `CriarLancamentoRequest` — entrada de cadastro

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `tipo` | `"receita" \| "despesa"` | sim | Tipo do lançamento. |
| `descricao` | `string` | sim | Texto não vazio após `trim`, até 200 caracteres. O valor salvo é o texto aparado. |
| `valor` | `string` | sim | Decimal positivo em formato `123` ou `123.45`, sem separador de milhar, com até duas casas; até `90071992547409.91` para caber em centavos seguros. |
| `categoria` | `string` | sim | Uma das categorias fixas, sem distinção por tipo. |
| `data` | `string` | sim | Data civil válida em `AAAA-MM-DD`, ano de `0001` a `9999`, sem conversão de fuso. |

```json
{
  "tipo": "despesa",
  "descricao": "Almoço",
  "valor": "32.50",
  "categoria": "Alimentação",
  "data": "2026-10-15"
}
```

O formulário pode receber vírgula decimal (`32,50`), mas a camada de serviço do frontend a converte para ponto antes do envio. Valores numéricos JSON, sinais, notação exponencial e mais de duas casas são inválidos na API. Campos adicionais não participam do contrato e são rejeitados para tornar erros de digitação visíveis. Valores em branco ou compostos de espaços são inválidos.

#### `Lancamento` — registro retornado pela API

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `number` inteiro seguro | sim | Identificador gerado pelo SQLite. |
| `tipo` | `"receita" \| "despesa"` | sim | Tipo cadastrado. |
| `descricao` | `string` | sim | Descrição aparada. |
| `valorCentavos` | `number` inteiro seguro positivo | sim | Valor exato em centavos. |
| `categoria` | `string` | sim | Categoria cadastrada. |
| `data` | `string` | sim | Data civil `AAAA-MM-DD`. |

```json
{
  "id": 42,
  "tipo": "despesa",
  "descricao": "Almoço",
  "valorCentavos": 3250,
  "categoria": "Alimentação",
  "data": "2026-10-15"
}
```

#### `ConsultaMensal` — lista e resumo do mesmo período

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `mes` | `string` | sim | Período consultado em `AAAA-MM`. |
| `lancamentos` | `Lancamento[]` | sim | Registros do mês, por data decrescente e `id` decrescente. |
| `resumo` | `ResumoMensal` | sim | Totais calculados da mesma lista. |

```json
{
  "mes": "2026-10",
  "lancamentos": [
    { "id": 42, "tipo": "despesa", "descricao": "Almoço", "valorCentavos": 3250, "categoria": "Alimentação", "data": "2026-10-15" }
  ],
  "resumo": { "receitasCentavos": 0, "despesasCentavos": 3250, "saldoCentavos": -3250 }
}
```

> **Mês vazio:** `lancamentos` é `[]` e os três totais são zero. O frontend mostra uma mensagem específica para ausência de registros, distinta de falha de consulta.

```json
{
  "mes": "2026-09",
  "lancamentos": [],
  "resumo": { "receitasCentavos": 0, "despesasCentavos": 0, "saldoCentavos": 0 }
}
```

#### `ResumoMensal` — totais em centavos

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `receitasCentavos` | `number` inteiro seguro não negativo | sim | Soma das receitas do mês. |
| `despesasCentavos` | `number` inteiro seguro não negativo | sim | Soma das despesas do mês. |
| `saldoCentavos` | `number` inteiro seguro | sim | Receitas menos despesas. |

```json
{ "receitasCentavos": 1030, "despesasCentavos": 305, "saldoCentavos": 725 }
```

Cada valor é convertido da string decimal por separação das partes inteira e fracionária, sem usar aritmética de ponto flutuante para a conversão ou soma. O serviço verifica `Number.isSafeInteger` em cada soma; se um histórico exceder o limite, a consulta falha explicitamente em vez de retornar total impreciso. A UI divide centavos por 100 somente para apresentação com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.

#### `ErroApi` — envelope de erro

| Código | HTTP | Significado |
| --- | --- | --- |
| `DADOS_INVALIDOS` | 400 | Corpo ou campos do cadastro inválidos. |
| `MES_INVALIDO` | 400 | Consulta sem `mes`, com valor repetido ou fora de `AAAA-MM` válido. |
| `NAO_ENCONTRADO` | 404 | Rota desconhecida. |
| `BANCO_INDISPONIVEL` | 503 | Falha de leitura ou gravação no SQLite. |
| `ERRO_INTERNO` | 500 | Falha inesperada ou total fora da faixa segura. |

```json
{
  "error": {
    "code": "DADOS_INVALIDOS",
    "message": "Confira os dados do lançamento.",
    "fields": { "valor": "Informe um valor positivo com até duas casas decimais." }
  }
}
```

`fields` é opcional, aparece apenas em erros de cadastro e mapeia nomes de campo para mensagens em português. Erros de banco e internos não expõem SQL, caminhos locais ou dados pessoais. JSON malformado usa `DADOS_INVALIDOS` sem `fields`.

#### `HealthResponse` — estado do serviço

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `status` | `"healthy"` | sim | Aplicação e banco prontos. |
| `timestamp` | `string` ISO 8601 | sim | Instante da verificação em UTC. |

```json
{ "status": "healthy", "timestamp": "2026-10-15T14:20:00.000Z" }
```

#### Categorias fixas — valores aceitos em `categoria`

| Valor | Uso |
| --- | --- |
| `Salário`, `Trabalho extra`, `Alimentação`, `Moradia`, `Transporte`, `Saúde`, `Educação`, `Lazer`, `Outros` | Qualquer um dos dois tipos de lançamento. |

```json
{ "categoria": "Outros" }
```

A lista é mantida como constante explícita em cada aplicação, com teste de contrato que detecta divergência. Não há endpoint de categorias nem personalização nesta versão.

#### `lancamentos` — tabela SQLite

| Coluna | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `INTEGER PRIMARY KEY` | sim | Identificador gerado pelo banco. |
| `tipo` | `TEXT` | sim | `receita` ou `despesa`, com `CHECK`. |
| `descricao` | `TEXT` | sim | Até 200 caracteres, validada no serviço. |
| `valor_centavos` | `INTEGER` | sim | Positivo, com `CHECK (valor_centavos > 0)`. |
| `categoria` | `TEXT` | sim | Categoria validada no serviço. |
| `data` | `TEXT` | sim | `AAAA-MM-DD` validada no serviço. |

```sql
CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  categoria TEXT NOT NULL,
  data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data_id ON lancamentos (data DESC, id DESC);
```

O arquivo padrão é `backend/data/financeiro.sqlite`, definido por `DATABASE_PATH` (caminho absoluto ou relativo ao diretório `backend/`). O diretório é criado na inicialização. O arquivo e auxiliares `-wal`/`-shm` ficam no `.gitignore`. A inicialização cria o esquema antes de abrir a porta; falhas impedem a aplicação de anunciar disponibilidade. Testes usam arquivo temporário isolado, nunca o banco pessoal.

### Endpoints da API

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/lancamentos` | Valida e persiste um lançamento. |
| `GET` | `/api/lancamentos` | Consulta lançamentos e resumo de um mês. |
| `GET` | `/health` | Informa disponibilidade da aplicação e do banco. |

---

#### `POST /api/lancamentos`

Cria um lançamento; a inserção é única e atômica. Não há tentativa automática de repetição do POST após falha de rede.

**Corpo**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| Corpo JSON | `CriarLancamentoRequest` | — | Todos os campos obrigatórios; `Content-Type: application/json`; regras do modelo acima. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| 201 | `Lancamento` | Registro salvo. |
| 400 | `ErroApi` | JSON malformado, campo ausente ou inválido. Nenhum registro criado. |
| 503 | `ErroApi` | Inserção não concluída por falha no banco. |
| 500 | `ErroApi` | Falha inesperada. |

**Exemplo — sucesso**

```http
POST /api/lancamentos
Content-Type: application/json

{"tipo":"despesa","descricao":"Almoço","valor":"32.50","categoria":"Alimentação","data":"2026-10-15"}
```

```json
{"id":42,"tipo":"despesa","descricao":"Almoço","valorCentavos":3250,"categoria":"Alimentação","data":"2026-10-15"}
```

**Exemplo — erro de validação**

```http
POST /api/lancamentos
Content-Type: application/json

{"tipo":"despesa","descricao":" ","valor":"0","categoria":"Alimentação","data":"2026-02-30"}
```

```json
{"error":{"code":"DADOS_INVALIDOS","message":"Confira os dados do lançamento.","fields":{"descricao":"Informe uma descrição.","valor":"Informe um valor positivo com até duas casas decimais.","data":"Informe uma data válida."}}}
```

> Se a conexão cair após o servidor salvar, o cliente pode não saber se o cadastro ocorreu. A interface mantém o formulário e orienta a consultar o mês antes de reenviar, evitando duplicações por repetição automática.

---

#### `GET /api/lancamentos`

Retorna lista e resumo do mês solicitado em uma resposta coerente.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `mes` | `string` | — | Obrigatório, único, `AAAA-MM` com ano `0001` a `9999` e mês `01` a `12`. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| 200 | `ConsultaMensal` | Consulta concluída, com ou sem registros. |
| 400 | `ErroApi` | Período ausente, repetido ou inválido. |
| 503 | `ErroApi` | Falha de leitura do banco. |
| 500 | `ErroApi` | Falha inesperada ou soma fora da faixa segura. |

**Exemplo — sucesso**

```http
GET /api/lancamentos?mes=2026-10
```

```json
{"mes":"2026-10","lancamentos":[{"id":42,"tipo":"despesa","descricao":"Almoço","valorCentavos":3250,"categoria":"Alimentação","data":"2026-10-15"}],"resumo":{"receitasCentavos":0,"despesasCentavos":3250,"saldoCentavos":-3250}}
```

**Exemplo — mês vazio**

```http
GET /api/lancamentos?mes=2026-09
```

```json
{"mes":"2026-09","lancamentos":[],"resumo":{"receitasCentavos":0,"despesasCentavos":0,"saldoCentavos":0}}
```

**Exemplo — período inválido**

```http
GET /api/lancamentos?mes=2026-13
```

```json
{"error":{"code":"MES_INVALIDO","message":"Selecione um mês válido."}}
```

> A busca usa limites inclusivos entre o primeiro e o último dia do mês, vinculados como parâmetros SQL; datas em formato ISO ordenam corretamente sem conversão de fuso. Cada resposta pertence apenas ao `mes` recebido. Falha de consulta mantém o resumo e a lista indisponíveis, sem exibir dados do período anterior.

---

#### `GET /health`

Mantém a rota existente e verifica se o banco responde. Não recebe parâmetros.

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| 200 | `HealthResponse` | Servidor e banco prontos. |
| 503 | `ErroApi` | Banco indisponível. |

**Exemplo — sucesso**

```http
GET /health
```

```json
{"status":"healthy","timestamp":"2026-10-15T14:20:00.000Z"}
```

**Exemplo — falha**

```http
GET /health
```

```json
{"error":{"code":"BANCO_INDISPONIVEL","message":"O serviço está temporariamente indisponível."}}
```

---

## Pontos de integração

Não há serviços externos. Frontend e backend são processos locais separados; `VITE_API_URL` aponta para a origem da API, com padrão `http://localhost:3000`, pois o Vite não tem proxy. O backend usa o CORS já instalado, restrito a `FRONTEND_ORIGIN` (padrão `http://localhost:5173`); se o Vite escolher outra porta, essa variável deve acompanhar a origem real. Não há autenticação por decisão de escopo do PRD; o servidor deve escutar apenas em endereço de loopback por padrão para manter o uso individual local. Se uma implantação remota for desejada, acesso, CORS e proteção dos dados precisam ser redesenhados antes.

O cliente usa `AbortController` para limitar requisições a 10 segundos e cancelar consultas substituídas por outro mês. GET pode ser repetido manualmente após falha. POST não é repetido automaticamente por não haver chave de idempotência; uma falha de rede não prova que a gravação falhou. O servidor devolve 503 para falhas do SQLite e registra o erro técnico no log central, sem incluir descrição, valor ou categoria.

## Abordagem de testes

Vitest cobre unidade e integração em cada aplicação; Playwright cobre as jornadas completas em `e2e/`. A cobertura de código deve ser de **no mínimo 80% em cada aplicação**, sem excluir módulos com comportamento. Testes próximos aos módulos, independentes, com dados e relógio controlados, sem depender do banco pessoal. Mocks são reservados a fronteiras externas, principalmente HTTP nos testes da UI; testes de integração do backend usam SQLite real em arquivo temporário. A matriz abaixo associa cada caso aos critérios do PRD.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | Conversão decimal exata e limites | CA-01, CA-02, CA-04 | `10.10`, `0.20` e `3.05` viram 1010, 20 e 305; zero, negativo, mais de duas casas, expoente e valor inseguro são recusados. |
| TU-02 | Validação de campos e categorias | CA-01, CA-02 | Obrigatórios, tipo, lista fixa, descrição aparada e comprimento produzem dados válidos ou erros por campo. |
| TU-03 | Validação de data e mês civil | CA-02, CA-03, CA-05 | Ano bissexto, dias inexistentes e limites de mês/ano são tratados corretamente sem fuso. |
| TU-04 | Resumo em centavos | CA-04, CA-05 | Totais são 1030, 305 e 725 no exemplo do PRD; lista vazia gera zeros; soma insegura falha explicitamente. |
| TU-05 | Validação e formatação no formulário | CA-02, CA-09 | Vírgula decimal é normalizada, entrada inválida é explicada em português e centavos aparecem em BRL. |
| TU-06 | Estado da consulta diante de respostas fora de ordem | CA-06, CA-08 | Resposta antiga ou cancelada não substitui dados do mês atual; erro não preserva totais antigos. |
| TU-07 | Contrato da lista de categorias | CA-01, CA-02 | As nove opções do PRD são aceitas nos dois tipos e opção desconhecida é recusada. |

Os testes de unidade verificam funções puras de validação, período, cálculo e apresentação; o hook pode ser testado com respostas HTTP controladas na fronteira de rede. Cada teste isola um comportamento e verifica resultado e efeitos indevidos.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | POST válido persiste e responde | CA-01, CA-07 | 201 devolve registro completo; nova conexão ao mesmo arquivo encontra o lançamento. |
| TI-02 | POST inválido não grava | CA-02 | Cada classe de entrada inválida retorna 400 e a contagem no banco permanece igual. |
| TI-03 | Consulta filtra mês e ordena registros | CA-03, CA-06 | Registros de outros meses não aparecem; ordem por data e id é estável. |
| TI-04 | Consulta calcula resumo e vazio | CA-04, CA-05 | Valores do exemplo e resposta vazia batem exatamente com contratos. |
| TI-05 | Falhas de banco e saúde | CA-08 | Rotas e `/health` retornam 503 com envelope seguro quando o banco fica indisponível; não indicam sucesso. |
| TI-06 | Formulário e serviço HTTP | CA-01, CA-02, CA-08, CA-09 | A UI envia contrato correto, mostra confirmação, erros de campo e falhas; controles têm rótulos e mensagens acessíveis. |

Testes HTTP inicializam `app` sem escutar porta e usam banco SQLite temporário por caso; fecham conexão e removem arquivos ao final. A integração da UI intercepta HTTP sem simular regras do próprio formulário.

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Cadastrar e conferir resumo do mês | CA-01, CA-03, CA-04 | Três lançamentos do exemplo resultam em lista correta e R$ 10,30, R$ 3,05 e R$ 7,25. |
| E2E-02 | Trocar período, ver vazio e preservar seleção | CA-05, CA-06 | Mês vazio mostra zeros; cadastro com data em outro mês não troca seleção; selecionar seu mês mostra o registro. |
| E2E-03 | Recarregar e reiniciar com banco persistente | CA-07 | Registro salvo sobrevive à recarga e ao reinício da API de teste. |
| E2E-04 | Validação e falha de serviço | CA-02, CA-08 | Formulário rejeita entrada inválida; indisponibilidade da API mostra erro e não mostra sucesso nem dados antigos. |
| E2E-05 | Uso em celular, desktop e teclado | CA-09 | Formulário, seletor, resumo, lista e avisos ficam legíveis e operáveis em larguras representativas, com foco e nomes acessíveis. |

Playwright inicia frontend e backend com `DATABASE_PATH` temporário próprio; os testes limpam dados por arquivo e usam relógio fixo para o mês inicial. A verificação de reinício usa o mesmo arquivo entre duas inicializações da API, sem depender de dados do desenvolvedor.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Configuração, abertura do SQLite, esquema e tipos: estabelece persistência segura e inicialização verificável.
2. Validação, conversão monetária, cálculo e repositório: concentra as regras financeiras antes do transporte HTTP.
3. Rotas, erros, `/health` e testes de integração: fixa contratos que a UI consumirá.
4. Cliente HTTP, estado da consulta, formulário e componentes de apresentação: implementa os fluxos do PRD sobre a API definida.
5. Testes de integração da UI, E2E, cobertura, acessibilidade e verificação de build/lint: confirma a jornada e a meta de 80%.

### Dependências técnicas

- Adicionar `sqlite3` e `sqlite` no backend: o driver oferece operações assíncronas e a camada `sqlite` fornece API baseada em Promises. As consultas usam parâmetros vinculados. [Documentação do driver](https://github.com/TryGhost/node-sqlite3/wiki/API), [documentação do wrapper](https://github.com/thelocalbranch/node-sqlite).
- Adicionar Vitest e coleta de cobertura nas duas aplicações, bibliotecas de teste de React no frontend e Playwright para `e2e/`; versionar os dois `package-lock.json` correspondentes. Configurar scripts `test`/`coverage` em cada aplicação e comando E2E na raiz somente se houver `package.json` raiz para essa responsabilidade.
- Instalar dependências e executar comandos separadamente em `backend/` e `frontend/`. Não há serviços externos, migração de dados existentes, CI ou proxy Vite no projeto inicial.

## Monitoramento e observabilidade

`GET /health` confirma que a aplicação e o SQLite estão prontos; falha do banco retorna 503. Um adaptador central de log registra inicialização e encerramento em nível informativo e falhas de leitura, gravação e erros inesperados em nível de erro, com código, rota e contexto técnico mínimo. Não registra payload financeiro nem caminhos completos de arquivos. Nesta aplicação local não há infraestrutura de métricas; a saúde e os logs do processo são os sinais disponíveis.

## Considerações técnicas

### Principais decisões

- Guardar dinheiro como `INTEGER` em centavos e calcular totais em inteiros evita arredondamento acumulado. Uma string decimal na entrada permite validar casas decimais sem depender da representação de número JSON. Inteiros são verificados antes de entrar no domínio e antes de serializar totais. [Referência sobre inteiros seguros em JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger).
- Guardar a data civil como texto ISO e consultar um intervalo do primeiro ao último dia mantém a data independente do fuso e permite índice por data. O formato é compatível com o uso de datas em texto pelo SQLite. [Referência SQLite](https://sqlite.org/lang_datefunc.html).
- Usar `sqlite3` com `sqlite` mantém I/O do banco fora de chamadas síncronas no caminho HTTP e permite `async`/`await`, conforme a regra Node do projeto. `node:sqlite` com `DatabaseSync` foi descartado por fazer I/O síncrono em requisições. [Documentação do wrapper](https://github.com/thelocalbranch/node-sqlite).
- Retornar lista e resumo juntos impede que a UI combine respostas de períodos distintos. Uma requisição por mês é suficiente para o volume pessoal previsto; paginação fica para uma necessidade futura demonstrada.
- Express 5 encaminha rejeições de handlers assíncronos ao tratamento de erros, o que permite um middleware central e respostas JSON uniformes. [Documentação Express 5](https://expressjs.com/en/5x/guide/error-handling/).
- O seletor usa controle de mês com valor `AAAA-MM`; o mês inicial vem do calendário local da pessoa, não de UTC. A aplicação mostra datas e moeda em português do Brasil. [Formato do controle de mês](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month).

### Riscos conhecidos

- Dependência nativa `sqlite3` pode exigir binário compatível ou compilação no ambiente de instalação; verificar com a versão Node suportada antes da implementação e registrar falhas de abertura na inicialização.
- O arquivo SQLite contém dados financeiros pessoais. O padrão de escuta em loopback, CORS local e exclusão do arquivo do Git reduzem exposição acidental; o usuário é responsável pelo backup local. Não há criptografia de disco no escopo do PRD.
- Uma falha de rede durante POST deixa o resultado incerto. A UI não repete a operação sozinha e orienta a conferir a listagem antes de reenviar. Deduplicação por chave de idempotência é uma evolução futura caso surja exigência de retentativas automáticas.
- Um total além de `Number.MAX_SAFE_INTEGER` centavos é recusado explicitamente. O limite é muito superior ao uso pessoal previsto, mas requer outro contrato numérico se o domínio crescer.
- Navegadores com suporte incompleto a `input type="month"` ainda devem permitir digitar `AAAA-MM`; os testes E2E verificam os navegadores escolhidos para a versão.

### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as regras em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `react.md` e `tests.md`. O `folder-structure.md` citado na raiz pelo `AGENTS.md` não existe; aplica-se o arquivo em `.agents/rules/`. A especificação mantém `frontend/` e `backend/` independentes, separa rotas, serviço e dados, e coloca HTTP do frontend em `services/`. Na implementação, arquivos TS/TSX terão até 100 linhas, funções e componentes até 30 linhas, tipos seguros sem `any`, sem comentários supérfluos, props explícitas e Tailwind para estilo. O backend terá configuração validada, logging central e encerramento gracioso. Testes automatizados são obrigatórios nas três camadas, com cobertura mínima de 80% por aplicação e sem exclusões artificiais. O backend não possui script de lint hoje; a implementação deve configurá-lo ou relatar a limitação e executar `npm run build` como verificação estática.

### Conformidade com skills

- `criar-techspec`: aplicada nesta especificação; PRD, exploração, esclarecimentos, template e casos de teste foram seguidos, sem desvios.
- `criar-tasks`: aplicável à próxima decomposição desta TechSpec em entregas incrementais; não executada nesta etapa.
- `executar-task`: aplicável à implementação futura das tarefas, com testes próprios; não executada nesta etapa.
- `executar-qa` e `executar-review`: aplicáveis à validação posterior da funcionalidade implementada; não executadas nesta etapa.

### Arquivos relevantes e dependentes

- Fonte de requisitos: `tasks/prd-gerenciador-financeiro-pessoal/prd.md`.
- Instruções: `AGENTS.md`, `.agents/rules/*.md`, `.agents/skills/02-criar-techspec/SKILL.md` e seu `references/TEMPLATE.md`.
- Base atual do backend: `backend/src/index.ts`, `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json`, `backend/nodemon.json`, `backend/.gitignore`.
- Base atual do frontend: `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/index.css`, `frontend/src/components/ui/button.tsx`, `frontend/vite.config.ts`, `frontend/tailwind.config.js`, `frontend/package.json`, `frontend/package-lock.json`.
- Novos módulos e testes ficam nos caminhos indicados em “Visão dos componentes”, com testes de unidade e integração próximos ao código e E2E em `e2e/`.
