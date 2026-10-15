# Documento de Requisitos do Produto (PRD)

## Visão geral

O gerenciador financeiro pessoal já permite consultar lançamentos e totais por mês, mas não mostra quanto das despesas pertence a cada categoria. A nova visão reúne os gastos do mês em uma lista de totais por categoria e em um gráfico de barras, para que a pessoa identifique a distribuição de suas despesas sem somar lançamentos manualmente.

A funcionalidade atende à mesma pessoa que usa o gerenciador local e individualmente. Cada categoria com despesas apresenta valor em reais e participação percentual no total de despesas do mês. **Premissa de período:** a visão acompanha o mês selecionado no controle que já existe; não haverá filtros adicionais de período.

## Objetivos

- Permitir a leitura dos gastos por categoria do mês selecionado. Critério de sucesso: 100% das categorias com despesas no mês aparecem na lista e no gráfico, com o mesmo total em ambos.
- Apresentar valores e percentuais corretos. Critério de sucesso: a soma dos valores das categorias corresponde exatamente ao total de despesas do resumo mensal, em centavos; cada percentual corresponde à participação da categoria nesse total, arredondada para duas casas decimais.
- Manter a visão coerente com a consulta mensal existente. Critério de sucesso: ao trocar o mês ou cadastrar uma despesa no mês consultado, lista e gráfico passam a refletir os dados atualizados junto ao resumo.
- Oferecer uma leitura acessível em celular e desktop. Critério de sucesso: nomes, valores e percentuais podem ser compreendidos em texto, sem depender de cor, tamanho das barras ou interação por ponteiro.

## Histórias de usuário

- US1: Como pessoa que acompanha as próprias finanças, quero ver o total gasto e o percentual de cada categoria no mês consultado para entender onde concentrei minhas despesas.
- US2: Como pessoa que compara meus meses, quero que a lista e o gráfico acompanhem o mês selecionado para examinar a distribuição de gastos de cada período disponível.
- US3: Como pessoa que consulta um mês sem despesas, quero ver uma mensagem clara para não interpretar a ausência de barras como erro.
- US4: Como pessoa que usa teclado ou tecnologia assistiva, quero acessar os mesmos nomes, valores e percentuais disponíveis no gráfico para compreender os gastos por categoria.

## Principais funcionalidades

- **Resumo de despesas por categoria:** consolida as despesas do mês selecionado e torna os totais legíveis.
  - RF1: Considerar somente lançamentos do tipo `despesa` pertencentes ao mês consultado e agrupar seus valores pelas categorias fixas já usadas no cadastro.
  - RF2: Mostrar uma linha para cada categoria com ao menos uma despesa, com nome, total em reais e percentual do total de despesas do mês.
  - RF3: Calcular o percentual de cada categoria em relação à soma de todas as despesas do mês, com apresentação de duas casas decimais. Não calcular percentuais quando essa soma for zero.
- **Gráfico de barras:** permite comparar visualmente as categorias presentes na lista.
  - RF4: Mostrar uma barra identificada para cada categoria com despesas, com proporção correspondente ao valor gasto na categoria e acesso ao seu valor e percentual em texto.
  - RF5: Manter categorias, valores e percentuais do gráfico consistentes com a lista e com o total de despesas do resumo mensal.
- **Integração à consulta existente:** preserva a jornada mensal do produto.
  - RF6: Atualizar lista e gráfico quando o mês selecionado mudar ou quando uma despesa cadastrada no mês consultado atualizar a consulta.
  - RF7: Exibir um estado vazio específico quando o mês não tiver despesas, inclusive se houver receitas, e um estado de indisponibilidade quando a consulta falhar.

## Critérios de aceitação

- CA-01 (US1; RF1, RF2, RF5): Dado um mês com despesas de R$ 10,10 e R$ 0,20 em `Alimentação`, R$ 3,05 em `Transporte` e uma receita em qualquer categoria, quando a visão for exibida, então `Alimentação` apresenta R$ 10,30, `Transporte` apresenta R$ 3,05 e a soma das categorias é igual aos R$ 13,35 de despesas do resumo mensal; a receita não altera esses valores.
- CA-02 (US1; RF3, RF4): Dado um mês com R$ 30,00 em uma categoria e R$ 70,00 em outra, quando a visão for exibida, então lista e gráfico identificam ambas com seus valores e com participações de 30,00% e 70,00%, respectivamente; a barra de R$ 70,00 representa um gasto maior que a de R$ 30,00.
- CA-03 (US1; RF2, RF4): Dada uma categoria sem despesas no mês, quando a visão for exibida, então ela não ocupa uma linha nem uma barra; toda categoria com despesas aparece uma vez em cada representação.
- CA-04 (US2; RF6): Dados lançamentos em meses diferentes, quando a pessoa troca o mês no seletor existente, então lista, gráfico e resumo passam a corresponder somente ao mês escolhido, sem conservar dados do mês anterior.
- CA-05 (US2; RF6): Dado um cadastro de despesa para o mês consultado, quando a consulta for atualizada, então o valor e o percentual da categoria, a barra correspondente e o total de despesas refletem o novo lançamento.
- CA-06 (US3; RF7): Dado um mês sem despesas, mesmo que existam receitas, quando a consulta terminar, então a visão informa que não há gastos por categoria no mês e não apresenta barras ou percentuais indefinidos.
- CA-07 (US3; RF7): Dada uma falha de consulta, quando ela ocorrer, então a visão informa que os dados por categoria estão indisponíveis e não apresenta resultados antigos como atuais.
- CA-08 (US4; RF2, RF4, RF5): Dado o uso em celular ou desktop, com teclado ou tecnologia assistiva, quando a visão for percorrida, então cada categoria, valor e percentual pode ser identificado em texto legível e a informação não depende exclusivamente de cor ou comprimento da barra.

## Experiência do usuário

- O público principal é a pessoa que já registra receitas e despesas no gerenciador e quer entender a composição dos gastos do mês. Não há perfil secundário ou configuração adicional nesta funcionalidade.
- Na mesma tela da consulta mensal, a pessoa escolhe um mês pelo seletor existente e encontra uma seção intitulada “Gastos por categoria”, com lista de totais e gráfico de barras. O conteúdo acompanha o resumo e os lançamentos do período.
- Cada categoria com despesas mostra nome, valor em reais e percentual com duas casas decimais. Lista e gráfico devem ter rótulos claros, manter a leitura em telas estreitas e apresentar a mesma informação sem exigir passar o ponteiro sobre uma barra.
- A interface usa português, contraste adequado, foco visível e ordem de leitura compreensível para teclado e leitores de tela. O gráfico complementa os valores textuais; cores não são o único meio de distinguir categorias.
- Um mês sem despesas mostra uma mensagem própria. Durante carregamento ou falha da consulta, a seção comunica o estado e evita apresentar números de outro mês como se fossem atuais.
- Premissa: o mês escolhido no controle atual é o único período da visão. Não há seleção de intervalo de datas nem outro filtro temporal.

## Restrições técnicas de alto nível

- A funcionalidade deve integrar-se ao gerenciador existente, composto por frontend React com TypeScript e backend Node.js com TypeScript, e usar os lançamentos e categorias já disponíveis no produto.
- Valores monetários e somas devem manter precisão em centavos; o arredondamento a duas casas ocorre apenas na apresentação do percentual.
- Os dados continuam sendo financeiros pessoais em uso local e individual. A visão não exige autenticação, sincronização ou integração externa.
- Lista e gráfico devem permanecer utilizáveis na consulta mensal de um histórico pessoal em celular e desktop. Não há meta adicional de volume ou latência definida.

## Fora do escopo

- Ordenar categorias pelo maior gasto ou oferecer opções de ordenação.
- Criar filtros de período além do seletor de mês já existente, incluindo intervalos personalizados.
- Agrupar ou comparar receitas por categoria; a visão trata apenas de despesas.
- Listar despesas individuais dentro de cada categoria, filtrar a lista de lançamentos ao selecionar uma barra ou oferecer detalhamento por clique.
- Criar, editar ou personalizar categorias, bem como incluir orçamento, metas, previsão, exportação ou compartilhamento.
