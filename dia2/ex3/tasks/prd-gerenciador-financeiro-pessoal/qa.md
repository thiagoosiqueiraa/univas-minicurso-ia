# Relatório de QA — Gerenciador financeiro pessoal

As evidências da ferramenta de navegador estão em `tasks/prd-gerenciador-financeiro-pessoal/evidences/`.

## Resumo

- Data: 2026-10-15
- Status: APROVADO
- Total de critérios de aceitação: 9
- Critérios de aceitação atendidos: 9
- Bugs encontrados: 2 (corrigidos)

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Cadastro válido salva, confirma e exibe o lançamento no mês correspondente. | TU-01, TU-02, TU-07, TI-01, TI-06, E2E-01 | PASSOU | [Resumo e lançamentos](evidences/ca-04-resumo-mensal.png) |
| CA-02 | Entradas inválidas no formulário e na API não criam lançamentos e identificam o problema. | TU-01, TU-02, TU-03, TU-05, TU-07, TI-02, TI-06, E2E-04 | PASSOU | [Falha e validação](evidences/ca-08-falha-de-consulta.png) |
| CA-03 | A consulta mensal lista somente os lançamentos do período, com os dados exigidos. | TU-03, TI-03, E2E-01, E2E-02 | PASSOU | [Resumo e lançamentos](evidences/ca-04-resumo-mensal.png) |
| CA-04 | Receitas R$ 10,30, despesas R$ 3,05 e saldo R$ 7,25 no exemplo do PRD. | TU-01, TU-04, TI-04, E2E-01 | PASSOU | [Resumo exato do PRD](evidences/ca-04-resumo-mensal.png) |
| CA-05 | Mês sem lançamentos mostra estado vazio e totais zerados. | TU-03, TU-04, TI-04, E2E-02 | PASSOU | [Mês vazio](evidences/ca-05-mes-vazio.png) |
| CA-06 | Trocar o mês atualiza lista e resumo sem misturar períodos. | TU-06, TI-03, E2E-02 | PASSOU | [Mês vazio e troca de período](evidences/ca-05-mes-vazio.png) |
| CA-07 | Registros permanecem disponíveis após recarga e reinício da API. | TI-01, E2E-03 | PASSOU | E2E-03 verificou recarga e reinício usando o mesmo SQLite temporário. |
| CA-08 | Falhas de cadastro ou consulta mostram mensagem clara e não exibem sucesso ou dados antigos. | TU-06, TI-05, TI-06, E2E-04 | PASSOU | [Falha de consulta](evidences/ca-08-falha-de-consulta.png) |
| CA-09 | Tela responsiva, legível e operável em português, com valores em reais. | TU-05, TI-06, E2E-05 | PASSOU | [Celular](evidences/ca-09-celular.png), [desktop](evidences/ca-09-desktop.png) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Cadastrar lançamentos e conferir o resumo mensal | PASSOU | Fixture ajustada para o exemplo exato do CA-04: R$ 10,10 + R$ 0,20 e despesa de R$ 3,05. |
| E2E-02 | Trocar período, ver vazio e preservar seleção | PASSOU | Verificados zeros, estado vazio e seleção do mês após cadastro com data em outro mês. |
| E2E-03 | Recarregar e reiniciar com banco persistente | PASSOU | O mesmo arquivo SQLite temporário foi usado após reiniciar a API. |
| E2E-04 | Validar entrada e tratar falha de serviço | PASSOU | Verificada mensagem de validação, erro de consulta e ausência de dados antigos ou sucesso indevido. |
| E2E-05 | Usar em celular, desktop e por teclado | PASSOU | Viewports 390×844 e 1440×900; Tab, Escape, Enter, rótulos e idioma do documento verificados. |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade | TU-01 a TU-04, TU-07 | PASSOU | `cd backend && npm test` | 69 testes backend passaram no total. |
| Unidade | TU-05 a TU-07 | PASSOU | `cd frontend && npm test` | 13 testes frontend passaram no total, incluindo regressões para `Button` e `cn`. |
| Integração | TI-01 a TI-05 | PASSOU | `cd backend && npm test` | SQLite temporário, validação HTTP, consulta, erros e saúde. |
| Integração | TI-06 | PASSOU | `cd frontend && npm test` | Serviço HTTP e interação do formulário. |
| Cobertura backend | — | PASSOU | `cd backend && npm run coverage` | 85,78% statements; 92,10% branches; 80,43% functions; 87,95% lines. |
| Cobertura frontend | — | PASSOU | `cd frontend && npm run coverage` | 86,28% statements; 83,33% branches; 84,61% functions; 93,38% lines. |
| E2E | E2E-01 a E2E-05 | PASSOU | `cd e2e && npm test` | 5 cenários Playwright passaram na execução final. |
| Estático backend | — | PASSOU | `cd backend && npm run lint && npm run build` | Sem erros. |
| Estático frontend | — | PASSOU | `cd frontend && npm run lint && npm run typecheck && npm run build` | Sem erros; um aviso ESLint de Fast Refresh em `components/ui/button.tsx` e aviso de base Browserslist antiga no build. |

## Acessibilidade

- [x] Navegação por teclado (Tab, Enter, Escape) verificada no E2E-05.
- [x] Controles interativos têm rótulos descritivos; consultados por seus nomes acessíveis no E2E.
- [x] Não há imagens de conteúdo na tela que precisem de texto alternativo.
- [x] Contraste inspecionado visualmente: texto, controles, botão e valores permanecem legíveis; os totais também têm rótulos textuais.
- [x] Rótulos associados aos campos verificados por `getByLabel` no E2E.
- [x] Erros de campo associados com `aria-describedby`; falha da consulta exposta como `role="alert"`.
- [x] Tipografia e espaçamento inspecionados nas larguras de celular e desktop.

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | Documento declarava `lang="en"` e título padrão “Vite + React”, embora a interface estivesse em português. | Baixa | Corrigido | Definidos `lang="pt-BR"`, título “Finanças pessoais” e idioma nos controles nativos de mês e data. | E2E-05 verifica idioma e título do documento e idioma declarado nos campos. | [Tela desktop](evidences/ca-09-desktop.png) |
| BUG-02 | O cenário E2E-01 usava valores diferentes do exemplo numérico obrigatório do CA-04. | Média | Corrigido | Atualizado o cenário para duas receitas de R$ 10,10 e R$ 0,20 e despesa de R$ 3,05, com assertions de R$ 10,30, R$ 3,05 e R$ 7,25. | E2E-01 atualizado e reexecutado com sucesso. | [Resumo exato](evidences/ca-04-resumo-mensal.png) |

## Conclusão

Os nove critérios de aceitação foram verificados e atendidos. Testes unitários, de integração e E2E passaram; as duas aplicações superaram 80% de cobertura. O idioma do documento e o título foram corrigidos. Os controles HTML nativos de mês e data continuam exibindo sua representação conforme o locale visual do Chromium do ambiente, mesmo com `lang="pt-BR"`; os rótulos, mensagens e demais textos da aplicação estão em português. Os serviços e bancos temporários iniciados para a validação foram encerrados e as portas 3000, 3005, 5100 e 5105 foram liberadas.
