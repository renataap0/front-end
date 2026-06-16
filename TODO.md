# Status do Projeto - Racing Angels

O projeto foi consolidado com frontend institucional, painel operacional, loja, rankings, biblioteca de pistas e backend REST em Node.js, Express, TypeScript, MySQL e Prisma.

## Entregas Concluidas

- Portal com paginas de equipe, dashboard, analises, pistas, classificacao, loja, contato e login.
- Backend em camadas com autenticacao JWT, bcrypt, Zod, CORS, Prisma ORM e seed inicial.
- Banco MySQL com tabelas operacionais, migration inicial e dados de largada.
- Perfis admin, equipe e corredor com permissoes separadas.
- Loja com calculo de carrinho no frontend e pedidos calculados no backend.
- Rankings de pilotos, carros, pistas e metricas gerais de performance.

## Validacao Local

- `npm run build`
- `npx prisma validate`
- `npx prisma migrate status`
- `npx prisma db seed`


