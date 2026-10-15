# Claro Finanças

Gerenciador financeiro pessoal com React, TypeScript, Express e SQLite. Requer Node.js 22.13 ou superior (usa `node:sqlite`).

## Iniciar

Abra dois terminais na pasta do projeto:

```bash
cd backend
npm ci
npm run dev
```

```bash
cd frontend
npm ci
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente `http://localhost:5173`. A API usa `http://localhost:3000`. O arquivo SQLite é criado em `backend/data/financas.sqlite` e permanece entre reinícios. Para mudar esse caminho, configure `DATABASE_PATH` no ambiente da API.

## Verificar

```bash
cd backend
npm test
npm run build
```

```bash
cd frontend
npm run build
npm run lint
```

Valores são enviados à API como `valorCentavos` (inteiro positivo), evitando cálculos com casas decimais. `GET /api/lancamentos?mes=AAAA-MM` devolve lançamentos e totais do mês; `POST /api/lancamentos` recebe `tipo`, `descricao`, `valorCentavos`, `categoria` e `data` (`AAAA-MM-DD`).
