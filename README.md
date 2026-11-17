# Locadora

Projeto de uma locadora fictícia de filmes para maiores de 18 anos, feito para a disciplina de Desenvolvimento Web I.

## Para abrir

Abra `index.html` no navegador. É preciso estar conectado à internet para carregar o Bootstrap.

## O que o sistema faz

- Relaciona clientes, filmes e locações.
- Cadastra, edita, lista, devolve e exclui locações.
- Salva as locações no `localStorage` do navegador.
- Pesquisa por cliente ou filme, filtra por situação e gênero e ordena os resultados.
- Mostra a quantidade de cópias disponíveis de cada filme.

Uma locação não pode começar em uma data futura, a devolução não pode ser antes da locação e o mesmo cliente não pode alugar novamente o mesmo filme antes de devolvê-lo. Locações devolvidas não podem ser reabertas.

## Arquivos

- `index.html`: estrutura da página e componentes Bootstrap.
- `css/style.css`: estilos da locadora.
- `js/main.js`: dados e interações da página.