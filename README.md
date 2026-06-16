# Racing Angels/CorridaPro API

Backend completo em Node.js, Express, TypeScript, MySQL e Prisma ORM para integrar com o frontend Racing Angels/CorridaPro.

## Stack

- Node.js + Express
- TypeScript
- MySQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- CORS
- dotenv

## Estrutura

```txt
back-end/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    controllers/
    routes/
    services/
    middlewares/
    schemas/
    utils/
    app.ts
    server.ts
  .env.example
  package.json
  tsconfig.json
  README.md
```

## Instalar e rodar

Entre na pasta do backend:

```bash
cd back-end
```

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configure a conexao MySQL:

```env
DATABASE_URL="mysql://root:root@localhost:3306/racing_angels"
JWT_SECRET="troque_essa_chave"
PORT=3333
```

Crie o banco MySQL, se ainda nao existir:

```sql
CREATE DATABASE racing_angels;
```

Rode os comandos obrigatorios:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

A API ficara em:

```txt
http://localhost:3333
```

## Usuarios seed

| Usuario | Senha | Role |
| --- | --- | --- |
| admin | 123456 | admin |
| equipe | 123456 | team |
| corredor | 123456 | driver |

## Login

Todas as rotas exigem JWT, exceto `POST /api/auth/login`.

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"123456\"}"
```

Resposta:

```json
{
  "token": "jwt...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

Use o token nas demais rotas:

```bash
curl http://localhost:3333/api/races \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Permissoes

- `admin`: controle total.
- `team`: cria corrida, cadastra pista e edita pilotos da propria equipe.
- `driver`: visualiza dados e pode fazer pedido na loja.

Regras aplicadas:

- Sem JWT, rotas protegidas retornam `401`.
- `team` nao pode deletar corrida.
- `driver` nao pode criar, editar ou excluir corridas, pilotos, pistas ou carros.
- Ao criar corrida como `team`, o backend ignora `teamId` enviado e usa o `teamId` do usuario logado.
- Pedidos calculam subtotal, frete e total no backend.
- Frete gratis quando subtotal `>= 500`; senao `39.90`.
- `order_items` usam o preco cadastrado em `products`.
- `/api/races` retorna `driver`, `team`, `track` e `car` populados.

## Rotas

### Auth

- `POST /api/auth/login`

### Users

- `GET /api/users`
- `GET /api/users/me`

### Teams

- `GET /api/teams`
- `POST /api/teams`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`

### Drivers

- `GET /api/drivers`
- `GET /api/drivers/:id`
- `POST /api/drivers`
- `PUT /api/drivers/:id`
- `DELETE /api/drivers/:id`

### Cars

- `GET /api/cars`
- `GET /api/cars/:id`
- `POST /api/cars`
- `PUT /api/cars/:id`
- `DELETE /api/cars/:id`

### Tracks

- `GET /api/tracks`
- `GET /api/tracks/:id`
- `POST /api/tracks`
- `PUT /api/tracks/:id`
- `DELETE /api/tracks/:id`

### Races

- `GET /api/races`
- `GET /api/races/:id`
- `POST /api/races`
- `PUT /api/races/:id`
- `DELETE /api/races/:id`

### Seasons

- `GET /api/seasons`
- `POST /api/seasons`
- `GET /api/seasons/:id`
- `POST /api/seasons/:id/rounds`
- `POST /api/season-rounds/:id/laps`
- `GET /api/season-rounds/:id/laps`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`

### Analytics

- `GET /api/analytics`
- `GET /api/analytics/drivers`
- `GET /api/analytics/tracks`
- `GET /api/analytics/cars`
- `GET /api/analytics/rankings`

### Dashboard

- `GET /api/dashboard/summary`

## Filtros por query string

Algumas listagens aceitam filtros:

```txt
GET /api/races?teamId=1&status=Finalizada
GET /api/drivers?teamId=1&status=Titular
GET /api/cars?teamId=1
GET /api/tracks?type=Rua
GET /api/products?active=true&name=Camisa
GET /api/teams?country=Brasil
```

## Exemplos de payload

Criar corrida como admin:

```json
{
  "name": "Silverstone Sprint",
  "status": "Finalizada",
  "laps": 28,
  "bestLapMs": 87097,
  "lastLapMs": 87930,
  "teamId": 1,
  "driverId": 1,
  "trackId": 5,
  "carId": 1
}
```

Criar pedido:

```json
{
  "customerName": "Lia Torres",
  "customerEmail": "lia@example.com",
  "customerZip": "01001000",
  "paymentMethod": "card",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

## Integracao com o frontend

O arquivo `src/utils/frontend-api-example.js` contem funcoes prontas:

- `API_BASE_URL`
- `getToken`
- `apiFetch`
- `login`
- `getRaces`
- `createRace`
- `deleteRace`
- `getDrivers`
- `updateDriver`
- `getTracks`
- `createTrack`
- `getCars`
- `getProducts`
- `createOrder`
- `getAnalytics`
- `getDashboardSummary`

Copie ou importe essas funcoes no frontend e substitua as leituras de `localStorage` pelas chamadas da API.

Exemplo:

```js
import { login, getRaces } from "./back-end/src/utils/frontend-api-example.js";

await login("admin", "123456");
const races = await getRaces();
console.log(races);
```

Se o frontend estiver em outro host ou porta, o CORS ja esta habilitado no backend.

## Analytics

O backend calcula:

- Pontuacao de pilotos com `[25,18,15,12,10,8,6,4,2,1]`.
- Consistencia do piloto: media de `abs(last_lap_ms - best_lap_ms)`.
- Media de melhor volta.
- Melhor volta.
- Score do carro.
- Eficiencia da pista.
- Ranking geral com `best_driver`, `best_lap`, `best_car`, `best_track`, `most_consistent_driver`, `most_efficient_track`, `total_races`, `total_laps`, `avg_best_lap_ms`, `top_drivers`, `top_cars` e `top_tracks`.

Todos os tempos de volta sao `INT` em milissegundos.
