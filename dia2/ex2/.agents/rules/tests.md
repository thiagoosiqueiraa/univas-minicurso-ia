# Regras de testes

Estas regras se aplicam ao frontend, ao backend e aos testes E2E do projeto. Testes automatizados são obrigatórios para todo o código; esta regra é crítica e não deve ser ignorada. O percentual de cobertura deve ser de, no mínimo, **80%**. Cobertura é um indicador, não substitui a validação do comportamento.

## Prioridade e abrangência

Priorize testes pelo impacto de uma falha para as pessoas usuárias e para o negócio. Fluxos que envolvem dinheiro, segurança, dados ou operações irreversíveis merecem mais atenção que funcionalidades administrativas de baixo impacto. Por exemplo, um checkout deve receber mais cenários e atenção que o cadastro de uma categoria de produto.

Inclua testes abrangentes nas duas aplicações:

- **Frontend:** valide regras e interações da interface, estados de carregamento e erro, validações de formulários, acessibilidade relevante e integração com os serviços da aplicação.
- **Backend:** valide regras de negócio, validação de entrada, respostas HTTP, autorização, tratamento de erros e integração entre rotas e serviços.
- **E2E:** valide os principais fluxos completos de usuário atravessando a interface e a API.

Não deixe código sem cobertura automatizada. Inclua também caminhos de erro e limites relevantes, e não apenas o caminho feliz.

## FIRST

Siga os princípios **FIRST** abaixo. O princípio *Timely* pode ser desconsiderado.

- **Fast (rápidos):** prefira testes que executem rapidamente. Use stubs para substituir dependências externas ou lentas, como serviços de terceiros, filas e banco de dados remoto, quando o objetivo do teste não for validar essa integração. Evite esperas fixas e operações desnecessariamente custosas.
- **Independent (independentes):** cada teste deve preparar os próprios dados e não depender da ordem de execução ou do resultado de outro teste. Um teste que falha não deve causar falhas em cascata.
- **Repeatable (repetíveis):** a mesma execução, nas mesmas condições, deve produzir o mesmo resultado. Controle relógio, aleatoriedade, estado compartilhado e dependências variáveis. Use mocks para fixar datas e respostas de APIs externas, por exemplo.
- **Self-Validating (autoavaliáveis):** cada teste deve declarar e verificar o resultado esperado com assertions claras. Não basta executar o código ou aumentar a cobertura; valide retornos, efeitos colaterais e comportamento observável, inclusive quando houver falha.

Exemplo de teste unitário rápido, independente e com resultado validado usando Vitest:

```ts
import { describe, expect, it, vi } from "vitest";
import { buscarPedido } from "./buscar-pedido";

describe("buscarPedido", () => {
  it("retorna o pedido encontrado pelo repositório", async () => {
    const pedido = { id: "pedido-1", total: 125 };
    const repositorio = { encontrarPorId: vi.fn().mockResolvedValue(pedido) };

    const resultado = await buscarPedido("pedido-1", repositorio);

    expect(resultado).toEqual(pedido);
    expect(repositorio.encontrarPorId).toHaveBeenCalledWith("pedido-1");
  });
});
```

## Estrutura e foco

Organize cada teste em **Given/When/Then** (Dado/Quando/Então) ou **AAA** (Arrange/Act/Assert: Preparar/Executar/Verificar). Separe claramente a preparação, a ação e as verificações. Foque em um requisito ou comportamento por teste; não misture cenários independentes em um único teste.

Use nomes que descrevam o comportamento e a condição, em vez de nomes vagos como `testa pedido`.

```ts
it("recusa o checkout quando o estoque é insuficiente", async () => {
  const estoque = { consultar: vi.fn().mockResolvedValue(0) };
  const resultado = await concluirCheckout(carrinho, estoque);
  expect(resultado).toMatchObject({ sucesso: false, motivo: "estoque_insuficiente" });
});
```

Adapte o exemplo ao formato real de retorno do código. As assertions devem expressar o requisito com precisão e também verificar que efeitos colaterais indevidos não ocorreram quando isso for relevante, como não cobrar um pedido recusado.

## Pirâmide de testes

Distribua os testes em uma pirâmide: uma base ampla de testes unitários rápidos, uma quantidade menor de testes de integração e poucos testes E2E cobrindo fluxos essenciais. Use testes de unidade para regras isoladas, testes de integração para verificar colaboração entre módulos e fronteiras (como rota e serviço), e E2E para confirmar jornadas completas. Evite duplicar em E2E todos os detalhes já cobertos por testes menores.

## Ferramentas e localização

- Use **Vitest** para testes unitários e de integração, tanto no frontend quanto no backend.
- Para testes **E2E**, prefira **Playwright**.
- Mantenha os testes E2E na pasta `e2e/`, na raiz do repositório, fora de `frontend/` e `backend/`.
- Coloque testes unitários e de integração próximos ao código testado ou em uma estrutura de testes claramente correspondente, mantendo a convenção consistente dentro de cada aplicação.
- Configure a coleta de cobertura para que o mínimo de 80% seja verificável e visível. Não exclua arquivos de produção da medição apenas para atingir o limite; exclusões devem ser justificadas para arquivos que não contenham comportamento testável, como declarações de tipos.

Exemplo de organização:

```text
frontend/src/components/checkout/
  checkout.tsx
  checkout.test.tsx
backend/src/services/
  concluir-checkout.ts
  concluir-checkout.test.ts
e2e/
  checkout.spec.ts
```

Os exemplos de caminhos são ilustrativos. Preserve a separação entre as aplicações: comandos e dependências do frontend ficam em `frontend/`, os do backend em `backend/`, e os testes E2E ficam na raiz em `e2e/`.
