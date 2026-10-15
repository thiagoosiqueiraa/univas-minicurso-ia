# Tarefa 1.0: Backend: persistência, regras financeiras e API

## Visão geral

Entregar o backend completo do gerenciador financeiro: banco local persistente, regras de validação e cálculo, cadastro, consulta mensal, tratamento de erros e estado de saúde. Esta tarefa não depende das demais e estabelece o contrato consumido pela tarefa 2.0.

<skills>
### Conformidade com skills

- `.agents/skills/04-executar-task/SKILL.md`: aplicável à execução incremental desta tarefa e à marcação das subtarefas após testes.
- `.agents/skills/05-executar-qa/SKILL.md` e `.agents/skills/06-executar-review/SKILL.md`: aplicáveis às etapas posteriores de QA e revisão, quando solicitadas; não substituem os testes desta tarefa.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as regras em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `react.md` e `tests.md`. Para o backend, preservar a separação `routes/` → `services/` → `data/`, tipos seguros, arquivos TS de até 100 linhas, funções de até 30 linhas, I/O assíncrono, configuração validada, log central, encerramento gracioso, lockfile atualizado e testes Vitest junto ao código. A cobertura mínima é de 80% no backend. Não há desvio planejado. O guia de estrutura citado na raiz por `AGENTS.md` está em `.agents/rules/folder-structure.md`.
</rules>

<requirements>

- RF1–RF4: aceitar somente lançamentos válidos, persistir os dados e devolver respostas de cadastro e validação coerentes.
- RF5–RF7: consultar o mês solicitado, filtrar e ordenar registros e representar o mês vazio.
- RF8–RF9: calcular receitas, despesas e saldo com exatidão em centavos.
- RF10–RF11: manter o histórico após reinício e retornar erros seguros sem anunciar sucesso indevido.
- Respeitar os contratos HTTP, modelos, CORS local e disponibilidade definidos no `techspec.md`.
</requirements>

## Subtarefas

- [x] 1.1 Configurar dependências, scripts de teste e cobertura, variáveis de ambiente e tipos do domínio; atualizar `backend/package-lock.json`.
- [x] 1.2 Abrir e inicializar o SQLite em arquivo local, criar tabela e índice, proteger o arquivo no Git e fechar a conexão no encerramento.
- [x] 1.3 Implementar categorias fixas, validação dos campos e da data civil, conversão decimal exata e verificação de inteiros seguros.
- [x] 1.4 Implementar o repositório com consultas parametrizadas e os serviços de cadastro, consulta mensal e cálculo do resumo.
- [x] 1.5 Montar `POST /api/lancamentos`, `GET /api/lancamentos` e `GET /health`, com CORS, erros uniformes e logging sem dados financeiros.
- [x] 1.6 Implementar e executar os testes unitários e de integração abaixo com SQLite temporário; verificar cobertura mínima de 80%, build e lint disponível no backend.

## Detalhes de implementação

Seguir `techspec.md` em “Arquitetura do sistema”, “Design de implementação”, “Modelos de dados”, “Endpoints da API”, “Pontos de integração”, “Abordagem de testes” e “Monitoramento e observabilidade”. Usar a ordem interna das subtarefas para manter cada etapa verificável, sem antecipar responsabilidades da interface.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — Conversão decimal exata e limites
- [x] TU-02 — Validação de campos e categorias
- [x] TU-03 — Validação de data e mês civil
- [x] TU-04 — Resumo em centavos
- [x] TU-07 — Contrato da lista de categorias (aceitação no backend; comparação com a lista da UI na tarefa 2.0)

### Testes de integração

- [x] TI-01 — POST válido persiste e responde
- [x] TI-02 — POST inválido não grava
- [x] TI-03 — Consulta filtra mês e ordena registros
- [x] TI-04 — Consulta calcula resumo e vazio
- [x] TI-05 — Falhas de banco e saúde

## Arquivos relevantes

- `tasks/prd-gerenciador-financeiro-pessoal/prd.md`
- `tasks/prd-gerenciador-financeiro-pessoal/techspec.md`
- `backend/package.json`, `backend/package-lock.json`, `backend/tsconfig.json`, `backend/.gitignore`, `backend/.env.example`
- `backend/src/index.ts`, `backend/src/config.ts`, `backend/src/app.ts`, `backend/src/logger.ts`
- `backend/src/routes/`, `backend/src/services/`, `backend/src/data/`, `backend/src/types/`
