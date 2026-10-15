# Tarefa 3.0: E2E, cobertura e verificação final

## Visão geral

Validar as jornadas completas entre interface e API e concluir as verificações de qualidade da funcionalidade. Depende das tarefas 1.0 e 2.0, executadas nessa ordem.

<skills>
### Conformidade com skills

- `.agents/skills/04-executar-task/SKILL.md`: aplicável à criação e execução dos testes E2E desta tarefa.
- `.agents/skills/05-executar-qa/SKILL.md`: aplicável à validação final do comportamento, acessibilidade e responsividade após a implementação, quando solicitada.
- `.agents/skills/06-executar-review/SKILL.md`: aplicável à revisão de código posterior, quando solicitada.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos `AGENTS.md` e todas as regras em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md`, `react.md` e `tests.md`. Manter E2E em `e2e/`, com cenários independentes e repetíveis, banco temporário isolado, relógio controlado e asserções observáveis. Respeitar os limites de arquivos e funções TypeScript. Confirmar cobertura mínima de 80% em cada aplicação sem excluir módulos de comportamento e executar os comandos de verificação em `backend/` e `frontend/` separadamente. Não há desvio planejado. O guia de estrutura citado na raiz por `AGENTS.md` está em `.agents/rules/folder-structure.md`.
</rules>

<requirements>

- RF1–RF11: comprovar as jornadas de cadastro, consulta, resumo, persistência e comunicação de erros na aplicação integrada.
- CA-01–CA-09: verificar os critérios do PRD nos cenários E2E correspondentes, incluindo uso em celular, desktop e por teclado.
- Executar a cobertura e as verificações estáticas de ambas as aplicações conforme a TechSpec e as regras do projeto.
</requirements>

## Subtarefas

- [x] 3.1 Configurar Playwright em `e2e/` com inicialização de frontend e backend, banco SQLite temporário isolado e relógio fixo para o mês inicial.
- [x] 3.2 Automatizar cadastro, consulta, resumo, troca de período e estado vazio conforme E2E-01 e E2E-02.
- [x] 3.3 Automatizar recarga e reinício da API com o mesmo arquivo de teste para comprovar persistência conforme E2E-03.
- [x] 3.4 Automatizar validações e falhas do serviço, verificando ausência de sucesso indevido e de dados antigos conforme E2E-04.
- [x] 3.5 Verificar larguras de celular e desktop, teclado, foco, nomes acessíveis e mensagens conforme E2E-05.
- [x] 3.6 Executar E2E, testes e cobertura de backend e frontend; confirmar mínimo de 80% por aplicação, lint disponível, typecheck/build e corrigir falhas encontradas.

## Detalhes de implementação

Seguir `techspec.md` em “Abordagem de testes”, “Testes E2E”, “Sequenciamento do desenvolvimento” e “Riscos conhecidos”. Reusar os contratos e ambientes de teste das tarefas 1.0 e 2.0. O reinício da API deve reutilizar apenas o banco temporário do cenário E2E-03.

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

### Testes E2E

- [x] E2E-01 — Cadastrar e conferir resumo do mês
- [x] E2E-02 — Trocar período, ver vazio e preservar seleção
- [x] E2E-03 — Recarregar e reiniciar com banco persistente
- [x] E2E-04 — Validação e falha de serviço
- [x] E2E-05 — Uso em celular, desktop e teclado

## Arquivos relevantes

- `tasks/prd-gerenciador-financeiro-pessoal/prd.md`
- `tasks/prd-gerenciador-financeiro-pessoal/techspec.md`
- `e2e/`
- `backend/package.json`, `backend/package-lock.json`
- `frontend/package.json`, `frontend/package-lock.json`
