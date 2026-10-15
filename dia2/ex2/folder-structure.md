# Estrutura de pastas

O repositório contém duas aplicações independentes: `frontend/` e `backend/`. Mantenha cada responsabilidade na pasta indicada e preserve a separação entre interface, comunicação HTTP, regras de negócio e acesso a dados.

```text
.
├── backend/
│   └── src/
│       ├── routes/       # Rotas, controladores e integração com o protocolo HTTP
│       ├── services/     # Regras de negócio e comportamento da aplicação
│       ├── data/         # Consultas, persistência e acesso a APIs externas
│       └── types/        # Tipos compartilhados; um arquivo por tipo
├── frontend/
│   ├── public/           # Arquivos estáticos servidos sem processamento pelo Vite
│   └── src/
│       ├── assets/       # Imagens, fontes e outros recursos importados pelo código
│       ├── components/   # Componentes de interface reutilizáveis
│       ├── hooks/        # Hooks React reutilizáveis e lógica de interface
│       ├── services/     # Comunicação com o backend e adaptação de respostas
│       ├── types/        # Tipos compartilhados da interface
│       └── views/        # Telas e composição das áreas da aplicação
└── e2e/                  # Testes de ponta a ponta das jornadas principais
```

## Backend

- `backend/src/routes/`: define endpoints, interpreta requisições e transforma resultados em respostas HTTP. Encaminha o trabalho de aplicação para os serviços.
- `backend/src/services/`: implementa regras de negócio e coordena o comportamento da aplicação, sem depender de detalhes de transporte HTTP ou de fornecedores externos.
- `backend/src/data/`: concentra consultas, persistência e integrações com APIs externas. Fornece dados aos serviços.
- `backend/src/types/`: reúne tipos usados por diferentes módulos do backend. Mantenha um tipo por arquivo, com nomes descritivos.

## Frontend

- `frontend/src/components/`: componentes visuais reutilizáveis. Componentes exclusivos de uma tela podem permanecer junto da respectiva view, mantendo a organização consistente.
- `frontend/src/views/`: telas e composição da interface apresentada para cada rota ou área da aplicação.
- `frontend/src/services/`: chamadas ao backend e tratamento ou adaptação das respostas. Componentes e views não devem concentrar chamadas HTTP.
- `frontend/src/hooks/`: hooks personalizados para lógica reutilizável de estado e comportamento React.
- `frontend/src/assets/`: recursos importados pelo código, como imagens, ícones e fontes.
- `frontend/src/types/`: tipos compartilhados entre componentes, views e serviços. Tipos locais podem ficar próximos ao módulo que os utiliza.
- `frontend/public/`: arquivos estáticos acessados diretamente por URL, sem importação pelo código.

## Testes

- Testes unitários e de integração ficam próximos ao código testado, com convenção consistente em cada aplicação. Por exemplo, `services/buscar-item.test.ts` ao lado de `services/buscar-item.ts`.
- Testes E2E ficam em `e2e/`, na raiz do repositório, e cobrem os principais fluxos completos entre frontend e backend.
- Não crie pastas de teste sem necessidade; adicione-as quando o volume ou a organização dos testes justificar uma separação clara.

## Organização dos arquivos

Crie pastas adicionais somente quando representarem uma responsabilidade clara e ajudarem a manter os módulos coesos. Prefira nomes específicos para arquivos e evite concentrar responsabilidades diferentes em um único módulo.
