# Locadora

Projeto de locadora de filmes para a disciplina de Desenvolvimento Web I.

## Acessar o site

URL do projeto após a primeira publicação: https://kevinsteff.github.io/trabalho_webdev01/

Para executar localmente, abra `index.html` no navegador. O Bootstrap é carregado pela internet.

## Funcionalidades

- Dashboard com quantidade de filmes, locações totais, locações em andamento e locações atrasadas.
- Cadastro, edição, listagem, devolução e exclusão de locações.
- Cadastro, edição, listagem e exclusão de filmes.
- Pesquisa por cliente ou filme, filtros combinados por situação e gênero e ordenação.
- Dados de filmes e locações guardados no `localStorage` do navegador.
- Multa de R$ 2 por dia de atraso. Ao devolver o filme, o valor é calculado até a data da devolução.
- Renovação de uma locação em dia por mais sete dias, permitida uma única vez.

## Regras do sistema

- A data de início da locação não pode estar no futuro e a devolução não pode ser antes do início.
- O cliente não pode alugar novamente o mesmo filme antes de devolvê-lo.
- O estoque não pode ficar abaixo da quantidade de locações em andamento.
- Um filme ligado a qualquer locação não pode ser excluído, para manter o histórico.
- Uma locação devolvida não pode ser reaberta.
- Uma locação pode ser renovada uma vez, antes do vencimento e antes de ser devolvida.
- Os dados ficam somente no navegador em que foram cadastrados; não há servidor ou conta de usuário.

## Publicação no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica automaticamente o conteúdo do repositório quando há um push para a branch `etapa2`. Para conferir uma publicação, abra a aba **Actions** do GitHub e aguarde o workflow terminar. Nas configurações do repositório, em **Settings > Pages**, a origem deve estar definida como **GitHub Actions**.

## Arquivos

- `index.html`: estrutura e formulários da página.
- `css/style.css`: estilos e ajuste para telas menores.
- `js/main.js`: dados, regras e interações.