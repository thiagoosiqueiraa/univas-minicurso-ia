# Documento de Requisitos do Produto (PRD)

## Visão geral

O gerenciador financeiro pessoal permite que uma pessoa registre receitas e despesas e acompanhe o resultado de cada mês em uma única tela. Ele resolve a dificuldade de conferir quanto entrou, quanto saiu e qual é o saldo mensal a partir de lançamentos dispersos.

O produto é voltado ao uso pessoal, local e sem autenticação. A primeira versão oferece cadastro, consulta por mês, resumo financeiro e persistência dos lançamentos entre sessões.

## Objetivos

- Permitir o cadastro de lançamentos válidos com tipo, descrição, valor, categoria e data. Critério de sucesso: cada cadastro aceito aparece na consulta do mês correspondente com todos esses dados.
- Apresentar receitas, despesas e saldo corretos para qualquer mês consultado. Critério de sucesso: os totais correspondem à soma dos lançamentos daquele mês, e o saldo corresponde a receitas menos despesas, com precisão de centavos.
- Preservar os registros. Critério de sucesso: lançamentos cadastrados continuam disponíveis após recarregar a página e reiniciar a aplicação.
- Tornar a consulta compreensível em diferentes telas. Critério de sucesso: o cadastro e a consulta funcionam em larguras de celular e desktop, em português, com valores em reais e estados de sucesso, validação, erro e mês sem lançamentos identificáveis.

## Histórias de usuário

- US1: Como pessoa que organiza as próprias finanças, quero registrar uma receita ou despesa com seus dados para manter um histórico mensal.
- US2: Como pessoa que organiza as próprias finanças, quero consultar os lançamentos de um mês e ver o total de receitas, despesas e saldo para entender o resultado do período.
- US3: Como pessoa que organiza as próprias finanças, quero trocar o mês consultado para comparar períodos, inclusive meses sem movimentações.
- US4: Como pessoa que retorna à aplicação, quero encontrar os lançamentos anteriores após recarregar a página ou reiniciar a aplicação para não perder meu histórico.
- US5: Como pessoa que preenche o formulário, quero receber orientações claras quando houver dados inválidos ou falha no cadastro ou na consulta para saber como prosseguir.

## Principais funcionalidades

- **Cadastro de lançamentos:** recebe os dados necessários e confirma o resultado ao usuário.
  - RF1: Permitir escolher o tipo `receita` ou `despesa`, selecionar uma categoria de uma lista fixa e informar descrição, valor e data.
  - RF2: Exigir todos os campos; rejeitar descrição formada apenas por espaços, categoria fora da lista, data inválida e valor não positivo ou com mais de duas casas decimais.
  - RF3: Validar os dados também na API e retornar uma mensagem clara para entradas inválidas, sem criar o lançamento.
  - RF4: Após um cadastro válido, preservar o lançamento e atualizar a consulta e o resumo quando ele pertencer ao mês selecionado.
- **Consulta mensal:** organiza o histórico conforme o mês escolhido.
  - RF5: Iniciar a consulta no mês atual e permitir selecionar outro mês e ano.
  - RF6: Listar somente os lançamentos do mês selecionado, exibindo tipo, descrição, valor, categoria e data de cada um.
  - RF7: Mostrar um estado vazio explícito e valores zerados quando o mês não tiver lançamentos.
- **Resumo financeiro:** apresenta o resultado do período sem cálculos manuais pelo usuário.
  - RF8: Exibir o total de receitas, o total de despesas e o saldo do mês selecionado, calculado como receitas menos despesas.
  - RF9: Apresentar todos os valores monetários em reais e manter exatidão em centavos nos lançamentos e totais.
- **Continuidade e comunicação:** mantém o histórico e informa os estados da aplicação.
  - RF10: Manter os lançamentos disponíveis após recarga da página e reinício da aplicação.
  - RF11: Informar sucesso no cadastro, erros de validação e falhas de cadastro ou consulta em linguagem clara, sem apresentar dados incorretos como se fossem atuais.

## Critérios de aceitação

- CA-01 (US1; RF1, RF4): Dado um formulário preenchido com tipo, descrição, valor positivo com até duas casas decimais, categoria selecionada da lista e data válida, quando o usuário confirmar, então o lançamento é salvo, uma confirmação é exibida e ele aparece na consulta do seu mês.
- CA-02 (US5; RF2, RF3): Dado qualquer campo obrigatório vazio, descrição composta apenas por espaços, tipo diferente dos permitidos, categoria fora da lista, data inválida, valor zero, negativo ou com mais de duas casas decimais, quando o cadastro for enviado pelo formulário ou diretamente à API, então o lançamento não é criado e a resposta identifica o problema.
- CA-03 (US2; RF5, RF6): Dado um mês com lançamentos e lançamentos em outros meses, quando esse mês for selecionado, então apenas os registros do período são exibidos, cada um com tipo, descrição, valor, categoria e data.
- CA-04 (US2; RF8, RF9): Dados lançamentos no mês de duas receitas de R$ 10,10 e R$ 0,20 e uma despesa de R$ 3,05, quando o resumo for exibido, então receitas são R$ 10,30, despesas são R$ 3,05 e saldo é R$ 7,25.
- CA-05 (US3; RF5, RF7, RF8): Dado um mês sem lançamentos, quando ele for selecionado, então a listagem mostra um estado vazio e os três valores do resumo são R$ 0,00.
- CA-06 (US3; RF5, RF6, RF8): Dado que o usuário troca o mês selecionado, quando a consulta terminar, então listagem e resumo correspondem ao novo mês e não misturam lançamentos do período anterior.
- CA-07 (US4; RF10): Dado um lançamento salvo, quando a página for recarregada ou a aplicação for reiniciada, então o lançamento continua disponível na consulta do mês correspondente e participa dos totais.
- CA-08 (US5; RF11): Dada uma falha ao salvar ou consultar, quando ela ocorrer, então a interface mostra uma mensagem compreensível e não anuncia sucesso indevido.
- CA-09 (US1–US5; RF1, RF5, RF9, RF11): Dado o uso em celular ou desktop, quando a tela for exibida, então formulário, seletor de mês, resumo, lista e mensagens permanecem legíveis e operáveis, em português e com valores em reais.

## Experiência do usuário

- O público principal é uma pessoa que acompanha suas próprias finanças e deseja registrar movimentações rapidamente, sem configuração prévia.
- Ao abrir a aplicação, a pessoa vê o mês atual, um resumo com receitas, despesas e saldo, a listagem do período e o formulário de novo lançamento. Pode trocar o mês consultado e cadastrar uma movimentação com data em qualquer mês.
- O formulário identifica claramente campos obrigatórios e o tipo do lançamento e oferece uma lista fixa de categorias. Após o envio, a pessoa recebe confirmação ou uma mensagem que explica o dado a corrigir. Falhas de consulta e meses vazios têm mensagens distintas.
- A interface deve ser limpa e responsiva, com rótulos visíveis, foco perceptível, navegação por teclado, mensagens compreensíveis e contraste adequado. Totais devem ter identificação textual além de qualquer indicação por cor.
- A categoria é escolhida de uma lista fixa, conforme a preferência informada pelo usuário. Premissa para a composição inicial da lista: `Salário`, `Trabalho extra`, `Alimentação`, `Moradia`, `Transporte`, `Saúde`, `Educação`, `Lazer` e `Outros`. A opção `Outros` cobre lançamentos sem categoria específica.

## Restrições técnicas de alto nível

- Usar o frontend React com TypeScript e a API Node.js com TypeScript já preparados no repositório, respeitando suas convenções e a separação entre as duas aplicações.
- Persistir os lançamentos em SQLite. A persistência deve sobreviver à recarga da página e ao reinício da aplicação.
- Validar entradas no frontend e na API. A API deve usar consultas parametrizadas ao acessar o banco.
- Representar e calcular dinheiro com exatidão em centavos, evitando erros de arredondamento de ponto flutuante.
- Os registros são dados financeiros pessoais. A primeira versão é para uso local e individual, sem conta ou sincronização externa.
- Não há meta adicional de volume ou latência definida para esta versão; a consulta mensal deve permanecer utilizável para o histórico pessoal.

## Fora do escopo

- Autenticação, contas, perfis e compartilhamento entre usuários.
- Gráficos, relatórios avançados, metas, orçamento e previsão financeira.
- Importação bancária, sincronização, integrações externas e exportação de dados.
- Edição, exclusão, recorrência ou parcelamento de lançamentos.
- Criação, edição ou personalização das opções da lista fixa de categorias.
