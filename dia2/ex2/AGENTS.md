# Guia do projeto

Os padrões de codificação do projeto estão em [`.agents/rules/code-standards.md`](.agents/rules/code-standards.md). Siga essas regras ao criar ou alterar código.

As regras de JavaScript e TypeScript estão em [`.agents/rules/javascript-typescript.md`](.agents/rules/javascript-typescript.md). Siga-as ao criar ou alterar código JavaScript ou TypeScript.

As regras específicas de Node.js estão em [`.agents/rules/node.md`](.agents/rules/node.md). Siga-as ao criar ou alterar código do backend.

As regras específicas de React estão em [`.agents/rules/react.md`](.agents/rules/react.md). Siga-as ao criar ou alterar componentes, hooks e integrações do frontend.

As regras de testes automatizados estão em [`.agents/rules/tests.md`](.agents/rules/tests.md). Siga-as ao criar ou alterar código e testes.

Este repositório contém duas aplicações independentes: `frontend/` e `backend/`. Cada uma tem seu próprio `package.json` e `package-lock.json`; instale dependências e execute comandos dentro da pasta correspondente.

## Estrutura

A organização de diretórios e a responsabilidade de cada pasta estão documentadas em [`folder-structure.md`](folder-structure.md). Consulte esse guia ao criar ou mover arquivos.

## Portas e execução

- Backend: porta `3000` por padrão, configurável com a variável de ambiente `PORT`. A rota `GET http://localhost:3000/health` informa o estado do servidor.
- Frontend: servidor de desenvolvimento Vite na porta padrão `5173` (`http://localhost:5173`). O Vite pode escolher outra porta se a padrão estiver ocupada.
- Não há configuração de proxy entre frontend e backend no `vite.config.ts`; chamadas à API devem usar a URL apropriada.

Requer Node.js e npm. Em dois terminais, instale e inicie cada aplicação:

```bash
cd frontend
npm ci
npm run dev
```

```bash
cd backend
npm ci
npm run dev
```

`npm run dev` no backend usa nodemon e tsx para reiniciar o servidor ao alterar arquivos em `src/`. `dotenv` carrega variáveis de um arquivo `.env` no backend, se existir.

## Verificações e build

Execute os comandos na pasta indicada:

```bash
# frontend
npm run lint       # ESLint
npm run typecheck  # verificação TypeScript (tsc -b)
npm run build      # typecheck e bundle de produção em frontend/dist/
npm run preview    # pré-visualiza o build localmente
```

```bash
# backend
npm run build      # compila TypeScript para backend/dist/
npm start          # inicia o build compilado
```

Os testes automatizados devem seguir as regras em [`.agents/rules/tests.md`](.agents/rules/tests.md). No momento, o projeto ainda não configura testes: o script `test` do backend é apenas um placeholder que termina com erro (`no test specified`), e o frontend não define script `test`.
