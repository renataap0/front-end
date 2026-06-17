# Roteiro de apresentacao - Racing Angels

Este roteiro serve para apresentar o projeto completo: front-end, back-end, banco de dados, autenticacao, loja, dashboard e integracao entre as partes.

## 1. Abertura

Fala sugerida:

"Este projeto se chama Racing Angels. Ele e um portal de motorsport para gerenciamento e acompanhamento de uma equipe de corrida. O sistema tem telas para login, dashboard, equipe, grid, pistas, analytics, loja e contato. Por tras dessas telas existe uma API em Node.js com Express e JavaScript, integrada a um banco MySQL chamado `corridapro`."

Explique rapidamente as tres partes:

- Front-end: HTML, CSS e JavaScript puro.
- Back-end: Node.js, Express, JWT, bcrypt, Zod e mysql2.
- Banco de dados: MySQL com tabelas como `usuarios`, `pilotos`, `carros`, `pistas`, `corridas`, `produtos` e `pedidos`.

## 2. Estrutura do projeto

Mostre a raiz do projeto:

```txt
front-end/
back-end/
README.md
ROTEIRO_APRESENTACAO.md
```

Fala sugerida:

"A estrutura foi separada entre o que o usuario ve e o que processa dados. O `front-end` tem as paginas, estilos e scripts da interface. O `back-end` tem a API, as regras de negocio e a conexao com o MySQL."

Mostre rapidamente:

- `front-end/index.html`
- `front-end/pages/`
- `front-end/assets/css/style.css`
- `front-end/assets/js/script.js`
- `front-end/assets/js/api.js`
- `back-end/src/`
- `back-end/database/schema.sql`
- `back-end/database/seed.js`

## 3. Front-end

Mostre:

- `front-end/index.html`
- `front-end/pages/dashboard.html`
- `front-end/pages/equipe.html`
- `front-end/pages/grid.html`
- `front-end/pages/pistas.html`
- `front-end/pages/analytics.html`
- `front-end/pages/loja.html`

Fala sugerida:

"O front-end foi feito com HTML, CSS e JavaScript puro. Cada arquivo HTML representa uma tela do sistema. O CSS cria a identidade visual da Racing Angels, com layout responsivo e componentes visuais. O JavaScript controla as interacoes, como login, carrinho, formularios, filtros, cards, tabelas e atualizacao das telas."

Explique os arquivos principais:

- `style.css`: visual, cores, layout, responsividade e componentes.
- `script.js`: comportamento das telas, validacoes, calculos e renderizacao.
- `api.js`: funcoes para chamar a API usando `fetch`.

## 4. Integracao do front com a API

Mostre `front-end/assets/js/api.js`.

Fala sugerida:

"Para o front-end conversar com o back-end, foi criado o arquivo `api.js`. Ele centraliza as chamadas HTTP para `http://localhost:3000/api`. Assim, as telas nao precisam repetir codigo de `fetch` toda hora."

Pontos importantes:

- `window.API_BASE_URL` aponta para a API.
- `apiFetch` envia JSON e trata erro.
- O token JWT fica no `localStorage`.
- Quando existe token, ele e enviado no header:

```txt
Authorization: Bearer TOKEN
```

Exemplos de funcoes:

- `loginApi`
- `getDriversApi`
- `getTracksApi`
- `getRacesApi`
- `getProductsApi`
- `createOrderApi`

## 5. Login e perfis

Mostre:

- `front-end/pages/login.html`
- `front-end/assets/js/script.js`
- `front-end/assets/js/api.js`
- `back-end/src/routes/authRoutes.js`
- `back-end/src/services/authService.js`
- `back-end/src/middlewares/authMiddleware.js`

Fala sugerida:

"O login envia usuario e senha para `POST /api/auth/login`. O back-end busca o usuario no MySQL, valida a senha com bcrypt e retorna um token JWT. Esse token prova que o usuario esta autenticado."

Usuarios de teste:

| Usuario | Senha | Perfil |
| --- | --- | --- |
| admin | 123456 | admin |
| equipe | 123456 | team |
| corredor | 123456 | driver |

Explique os perfis:

- `admin`: controle completo.
- `team`: gerencia dados operacionais da equipe.
- `driver`: consulta dados e pode fazer pedidos.

## 6. Back-end

Mostre `back-end/src/app.js` e `back-end/src/server.js`.

Fala sugerida:

"O back-end foi feito em JavaScript com Node.js e Express. O `server.js` inicia a API. O `app.js` configura CORS, JSON, rota de login, middleware de autenticacao, rotas protegidas e tratamento de erros."

Fluxo principal:

1. `server.js` inicia a API.
2. `app.js` registra as rotas.
3. `/api/auth/login` fica publica.
4. As demais rotas passam pelo `authMiddleware`.
5. Controllers chamam services.
6. Services chamam DAOs.
7. DAOs executam SQL no MySQL.

## 7. Rotas, controllers, services e DAOs

Mostre um exemplo completo, como pilotos:

- `back-end/src/routes/driversRoutes.js`
- `back-end/src/controllers/driversController.js`
- `back-end/src/services/driversService.js`
- `back-end/src/daos/driversDao.js`

Fala sugerida:

"A API foi organizada em camadas para o codigo ficar mais facil de manter. A rota define o endpoint. O controller recebe a requisicao. O service aplica a regra de negocio. O DAO acessa o banco de dados."

Explique DAO em linguagem simples:

"DAO significa Data Access Object. Aqui ele e o arquivo responsavel por executar SQL no banco. Por exemplo, `driversDao.js` consulta a tabela `pilotos` e transforma o resultado para o formato que o front-end espera."

Exemplo do fluxo:

```txt
GET /api/drivers
routes -> controller -> service -> dao -> MySQL
```

## 8. Banco de dados MySQL

Mostre:

- `back-end/database/schema.sql`
- `back-end/database/seed.js`
- `back-end/.env`

Fala sugerida:

"O banco usado e MySQL. O schema cria o banco `corridapro` e as tabelas principais. O seed popula dados iniciais para a apresentacao, como usuarios, equipes, pilotos, carros, pistas, corridas, produtos e pedidos."

Tabelas principais:

- `usuarios`: login, senha e perfil.
- `equipes`: equipes de corrida.
- `pilotos`: pilotos vinculados a equipes.
- `carros`: carros vinculados a pilotos e equipes.
- `pistas`: pistas de corrida.
- `corridas`: historico de corridas.
- `temporadas`, `etapas_temporada`, `voltas_etapa`: calendario e voltas.
- `produtos`, `pedidos`, `itens_pedido`: loja.

Explique o `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=corridapro
PORT=3000
JWT_SECRET=root
```

Fala sugerida:

"Essas variaveis deixam as credenciais fora do codigo. Se o banco mudar de host, usuario ou senha, eu altero somente o `.env`."

## 9. Dashboard e analytics

Mostre:

- `front-end/pages/dashboard.html`
- `front-end/pages/analytics.html`
- `back-end/src/services/dashboardService.js`
- `back-end/src/services/analyticsService.js`

Fala sugerida:

"O dashboard mostra um resumo geral do sistema. O analytics transforma dados de corridas em indicadores, como melhores pilotos, melhores carros, eficiencia das pistas, melhor volta e consistencia."

Explique que os calculos usam dados reais vindos das tabelas:

- `corridas`
- `pilotos`
- `carros`
- `pistas`
- `voltas_etapa`

## 10. Tela de equipe, grid e pistas

Mostre:

- `front-end/pages/equipe.html`
- `front-end/pages/grid.html`
- `front-end/pages/pistas.html`
- `back-end/src/services/driversService.js`
- `back-end/src/services/racesService.js`
- `back-end/src/services/tracksService.js`

Fala sugerida:

"A tela de equipe mostra pilotos e carros. O grid acompanha corridas e tempos. A tela de pistas permite listar, cadastrar, editar e excluir pistas dependendo do perfil do usuario."

Regras importantes:

- Admin tem controle completo.
- Equipe pode criar corridas e gerenciar pistas.
- Piloto tem permissao mais limitada.
- Ao criar corrida como equipe, a API respeita o time do usuario logado.

## 11. Loja e pedidos

Mostre:

- `front-end/pages/loja.html`
- `front-end/assets/js/script.js`, parte do carrinho
- `back-end/src/services/ordersService.js`
- `back-end/src/daos/ordersDao.js`
- tabelas `produtos`, `pedidos`, `itens_pedido`

Fala sugerida:

"A loja permite adicionar produtos ao carrinho e finalizar pedido. O front-end monta a experiencia do carrinho, mas o back-end recalcula valores usando os produtos do banco. Isso evita confiar apenas no valor vindo da tela."

Explique:

- Produtos vêm de `GET /api/products`.
- Pedido e criado em `POST /api/orders`.
- Frete e calculado no back-end.
- Pedido fica vinculado ao usuario autenticado.

## 12. Seguranca e tratamento de erros

Mostre:

- `back-end/src/middlewares/authMiddleware.js`
- `back-end/src/middlewares/requireRole.js`
- `back-end/src/middlewares/errorMiddleware.js`
- `back-end/src/utils/AppError.js`

Fala sugerida:

"A API usa JWT para autenticar usuarios. O middleware `authMiddleware` verifica se o token existe e e valido. O `requireRole` controla permissoes por perfil. O `errorMiddleware` padroniza respostas de erro para o front-end."

Exemplos de erro:

- Token ausente: `401`.
- Sem permissao: `403`.
- Registro nao encontrado: `404`.
- Erro interno: `500`.

## 13. Como rodar para demonstracao

Explique os comandos:

Back-end:

```bash
cd back-end
npm install
npm run db:setup
npm run dev
```

Front-end:

```bash
npm install
npm run dev
```

URLs:

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Front-end: `http://localhost:8080/front-end/index.html`

Observacao:

"Para as rotas com banco funcionarem, o MySQL precisa estar ligado em `localhost:3306` com as credenciais configuradas no `.env`."

## 14. Ordem sugerida de demonstracao

1. Abrir o site no navegador.
2. Mostrar a pagina inicial.
3. Fazer login com `admin / 123456`.
4. Mostrar dashboard.
5. Mostrar equipe e pilotos.
6. Mostrar grid/corridas.
7. Mostrar pistas.
8. Mostrar analytics.
9. Mostrar loja e carrinho.
10. Mostrar `api.js` explicando a integracao.
11. Mostrar `app.js` explicando a API.
12. Mostrar uma rota, controller, service e DAO.
13. Mostrar `schema.sql` e explicar o banco.

## 15. Fechamento

Fala sugerida:

"Resumindo, o Racing Angels e um sistema completo dividido em front-end, back-end e banco de dados. O front-end entrega a experiencia visual. O back-end centraliza autenticacao, regras e seguranca. O MySQL guarda os dados. A organizacao em rotas, controllers, services e DAOs deixa o codigo mais facil de explicar, testar e evoluir."

## Arquivos principais para abrir durante a apresentacao

1. `README.md`
2. `front-end/index.html`
3. `front-end/assets/css/style.css`
4. `front-end/assets/js/script.js`
5. `front-end/assets/js/api.js`
6. `back-end/src/app.js`
7. `back-end/src/server.js`
8. `back-end/src/routes/authRoutes.js`
9. `back-end/src/controllers/authController.js`
10. `back-end/src/services/authService.js`
11. `back-end/src/middlewares/authMiddleware.js`
12. `back-end/src/routes/driversRoutes.js`
13. `back-end/src/controllers/driversController.js`
14. `back-end/src/services/driversService.js`
15. `back-end/src/daos/driversDao.js`
16. `back-end/database/schema.sql`
17. `back-end/database/seed.js`
18. `back-end/.env`
