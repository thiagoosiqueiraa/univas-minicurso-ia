# Tarefa 2.0: Frontend: cadastro e consulta mensal

## Visão geral

Entregar a tela React completa para cadastrar lançamentos, escolher o mês e consultar lista e resumo com estados de carregamento, vazio, sucesso, validação e falha. Depende da tarefa 1.0 para consumir os contratos da API.

<skills>
### Conformidade com skills

- `.agents/skills/04-executar-task/SKILL.md`: aplicável à implementação e aos testes desta tarefa.
- `.agents/skills/05-executar-qa/SKILL.md` e `.agents/skills/06-executar-review/SKILL.md`: aplicáveis às etapas posteriores de QA e revisão, quando solicitadas; não substituem os testes desta tarefa.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as regras em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `react.md` e `tests.md`. Para o frontend, manter HTTP em `services/`, estado reutilizável em `hooks/`, componentes pequenos com props explícitas, rótulos e foco acessíveis e classes Tailwind. Arquivos TS/TSX têm até 100 linhas; funções e componentes, até 30 linhas. Usar tipos seguros, Vitest junto ao código e cobertura mínima de 80% no frontend. Atualizar o lockfile ao alterar dependências. Não há desvio planejado. O guia de estrutura citado na raiz por `AGENTS.md` está em `.agents/rules/folder-structure.md`.
</rules>

<requirements>

- RF1–RF4: oferecer formulário com categoria fixa, validar antes do envio, mostrar confirmação e atualizar a consulta quando o cadastro pertencer ao mês selecionado.
- RF5–RF7: iniciar no mês local atual, permitir mudar o período, mostrar apenas seus lançamentos e sinalizar o mês vazio.
- RF8–RF9: exibir o resumo do período e formatar lançamentos e totais em reais, mantendo a precisão em centavos do contrato.
- RF10–RF11: recuperar dados persistidos pela API e diferenciar sucesso, validação e falha sem mostrar dados antigos como atuais.
- CA-09: manter formulário, seletor, resumo, lista e mensagens legíveis e operáveis em celular, desktop e por teclado.
</requirements>

## Subtarefas

- [x] 2.1 Configurar dependências, scripts de teste e cobertura do frontend e os tipos e categorias do contrato; atualizar `frontend/package-lock.json`.
- [x] 2.2 Implementar cliente HTTP com URL configurável, validação de respostas, timeout, cancelamento de consultas e mensagens de falha; evitar repetição automática de POST.
- [x] 2.3 Implementar validação do formulário, normalização de vírgula decimal, formatação BRL e apresentação de datas civis.
- [x] 2.4 Implementar hook de consulta por mês que inicia no calendário local, descarta respostas antigas e limpa lista e resumo quando houver erro.
- [x] 2.5 Montar a tela com seletor de mês, resumo, lista, estado vazio e estados de carregamento e falha.
- [x] 2.6 Montar o formulário acessível, mensagens de campo e confirmação; manter o mês selecionado ao cadastrar registro de outro período.
- [x] 2.7 Implementar e executar os testes unitários e de integração abaixo; verificar cobertura mínima de 80%, lint, typecheck e build do frontend.

## Detalhes de implementação

Seguir `techspec.md` em “Arquitetura do sistema”, “Principais interfaces”, “Modelos de dados”, “Pontos de integração”, “Abordagem de testes” e “Considerações técnicas”. Usar os endpoints e códigos de erro da tarefa 1.0. A comparação da lista fixa de categorias com o backend conclui o contrato TU-07.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09

## Testes da tarefa

### Testes de unidade

- [x] TU-05 — Validação e formatação no formulário
- [x] TU-06 — Estado da consulta diante de respostas fora de ordem
- [x] TU-07 — Contrato da lista de categorias (comparação entre frontend e backend)

### Testes de integração

- [x] TI-06 — Formulário e serviço HTTP

## Arquivos relevantes

- `tasks/prd-gerenciador-financeiro-pessoal/prd.md`
- `tasks/prd-gerenciador-financeiro-pessoal/techspec.md`
- `frontend/package.json`, `frontend/package-lock.json`, `frontend/vite.config.ts`
- `frontend/src/App.tsx`, `frontend/src/views/gerenciador-financeiro.tsx`
- `frontend/src/services/`, `frontend/src/hooks/`, `frontend/src/components/`, `frontend/src/types/`
