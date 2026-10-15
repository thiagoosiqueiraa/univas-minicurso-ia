Crie um gerenciador financeiro pessoal simples para registrar receitas e despesas e acompanhar o saldo mensal.

A aplicação deve permitir:
- Cadastrar lançamentos com tipo (receita ou despesa), descrição, valor, categoria e data.
- Listar os lançamentos do mês selecionado, mostrando os dados de cada lançamento.
- Exibir o total de receitas, o total de despesas e o saldo do mês, calculado como receitas menos despesas.
- Trocar o mês consultado e mostrar lista vazia e saldo zero quando não houver lançamentos.
- Manter os dados após recarregar a página e reiniciar a aplicação.

Use React com TypeScript no frontend, uma API em Node.js com TypeScript e SQLite para persistência. Se este repositório já tiver uma estrutura preparada, aproveite-a e preserve as convenções existentes.

Crie uma interface em português, limpa e responsiva, com formulário de lançamento, seletor de mês, resumo financeiro e listagem. Formate os valores em reais e apresente mensagens claras de sucesso, validação e erro.

Aceite apenas valores positivos e exija os campos do lançamento. Valide os dados também na API. Trate os valores monetários sem erros de arredondamento e use consultas parametrizadas no banco.

Mantenha o escopo enxuto: não inclua autenticação, gráficos, importação bancária nem integrações externas.

Inspecione o projeto antes de implementar. Faça perguntas se houver uma decisão importante que este pedido não resolveu. Implemente a aplicação e os testes essenciais para validação, persistência e saldo mensal. Execute as verificações disponíveis e corrija as falhas encontradas.

Ao terminar, explique como iniciar a aplicação, quais testes executou e o que ainda não conseguiu verificar.
