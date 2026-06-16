# Racing Angels - Full Stack Project

Portal oficial da **Racing Angels** — plataforma de performance para motorsport com gestão de equipes, pilotos, dados de corrida, loja e analytics.

## 📁 Estrutura do Projeto

```
front-end/
├── index.html             # Página inicial
├── dashboard.html         # Dashboard de corridas
├── analytics.html         # Análises e telemetria
├── equipe.html            # Gestão da equipe
├── grid.html              # Classificação/Grid
├── pistas.html            # Cadastro de pistas
├── loja.html              # Loja oficial
├── login.html             # Autenticação
├── contato.html           # Contato
├── script.js              # Lógica principal (front-end)
├── style.css              # Estilos
├── api.js                 # [DEPRECATED] Mover para assets/js/api.js
├── assets/
│   ├── js/
│   │   └── api.js         # ✅ Integração com backend API
│   └── shop/              # Assets da loja
└── back-end/
    ├── .env               # Configuração (DATABASE_URL, PORT, JWT_SECRET)
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── app.ts         # Express app
    │   ├── server.ts      # Servidor principal
    │   ├── config/
    │   │   ├── env.ts
    │   │   └── prisma.ts
    │   ├── controllers/   # Controladores (auth, users, races, etc.)
    │   ├── routes/        # Rotas da API
    │   ├── services/      # Lógica de negócio
    │   ├── middlewares/   # Auth, error handling
    │   ├── schemas/       # Validações (Zod)
    │   └── utils/
    │       ├── AppError.ts
    │       ├── asyncHandler.ts
    │       ├── http.ts
    │       └── serializers.ts
    └── prisma/
        ├── schema.prisma  # ORM model
        ├── seed.ts        # Dados iniciais
        └── migrations/    # Histórico de schemas
```

## 🚀 Início Rápido

### 1. **Configurar Backend**

#### Pré-requisitos:
- Node.js 18+
- MySQL 8 (local ou Docker)
- npm ou yarn

#### Docker (MySQL):
```bash
docker run --name ra-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=racing_angels \
  -p 3306:3306 \
  -d mysql:8
```

#### Setup Backend:
```bash
cd back-end

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migração e seed (cria tabelas e dados iniciais)
npx prisma migrate dev --name init

# Iniciar servidor (desenvolvimento)
npm run dev
```

**Esperado:**
```
Racing Angels API rodando em http://localhost:3333
```

### 2. **Configurar Frontend**

```bash
# Servir files estáticos (na pasta raiz do front-end)
cd front-end

# Opção 1: Python
python -m http.server 8080

# Opção 2: npx serve
npx serve .

# Opção 3: Live Server (VS Code extension)
# Click direto em index.html
```

Acesse: **http://localhost:8080** (ou a porta exibida)

## 🔌 Integração Front-End ↔ Backend API

### Variáveis de Ambiente (`.env`)

**Backend** (`back-end/.env`):
```env
DATABASE_URL="mysql://root:root@localhost:3306/racing_angels"
PORT=3333
JWT_SECRET=troque_essa_chave
```

### Funções Globais (em todos os HTML)

```html
<script src="assets/js/api.js"></script>
<script src="script.js"></script>
```

**Funções disponíveis (window object):**

```javascript
// Login
await window.loginApi('corredor', '123456');
// Armazena token e usuário em localStorage

// Fetch com token automático
const races = await window.getRacesApi();
const races = await window.getRacesApi({ teamId: 1 });

// Criar pedido
const order = await window.createOrderApi({ 
  customerName: 'João',
  items: [...] 
});

// Qualquer endpoint
await window.apiFetch('/races', { method: 'POST', body: JSON.stringify({...}) });
```

### Credenciais Padrão (seed)

| Usuário | Senha  | Role   | Acesso                           |
|---------|--------|--------|----------------------------------|
| admin   | 123456 | admin  | Controle total                   |
| equipe  | 123456 | team   | Gestão de pilotos, pistas, races |
| corredor| 123456 | driver | Visualização (piloto)           |

## 🧪 Testar Endpoints

### Login
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

### Listar Races
```bash
curl -X GET http://localhost:3333/api/races \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Criar Race
```bash
curl -X POST http://localhost:3333/api/races \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Interlagos GP",
    "teamId": 1,
    "driverId": 1,
    "trackId": 1,
    "carId": 1,
    "laps": 42,
    "bestLapMs": 81348,
    "lastLapMs": 82005,
    "raceDate": "2026-06-16T14:00:00Z"
  }'
```

## 📝 API Endpoints Principais

| Método | Endpoint                | Descrição                    |
|--------|-------------------------|------------------------------|
| POST   | `/api/auth/login`       | Login e gerar token JWT      |
| GET    | `/api/users`            | Listar usuários              |
| GET    | `/api/teams`            | Listar equipes               |
| GET    | `/api/drivers`          | Listar pilotos               |
| GET    | `/api/cars`             | Listar carros                |
| GET    | `/api/tracks`           | Listar pistas                |
| GET    | `/api/races`            | Listar corridas              |
| POST   | `/api/races`            | Criar corrida                |
| DELETE | `/api/races/:id`        | Deletar corrida              |
| GET    | `/api/products`         | Listar produtos (loja)       |
| POST   | `/api/orders`           | Criar pedido                 |
| GET    | `/api/analytics`        | Dados analíticos             |
| GET    | `/api/dashboard/summary`| Resumo do dashboard          |

## 🛠️ Scripts Úteis

### Backend (`back-end/`)

```bash
npm run dev                    # Desenvolvimento (ts-node)
npm run build                  # Build TypeScript
npm start                      # Rodar build
npx prisma generate           # Gerar Prisma Client
npx prisma migrate dev        # Migração com seed
npx prisma studio            # UI do banco (Web)
npx prisma seed              # Apenas seed
```

### Frontend

```bash
python -m http.server 8080   # Servir na porta 8080
npx serve .                  # Alternativa com serve
```

## 🔐 Autenticação

- **JWT Token** armazenado em `localStorage.racingAngelsToken`
- **User Data** armazenado em `localStorage.racingAngelsUser`
- Token enviado automaticamente em cada requisição (header: `Authorization: Bearer ...`)
- Rotas públicas: apenas `/api/auth/login`
- Rotas protegidas: requerem token válido

## 🗄️ Banco de Dados

**Provider:** MySQL 8  
**ORM:** Prisma v6  
**Tabelas principales:**

- **users** — usuários (admin, team, driver)
- **teams** — equipes de corrida
- **drivers** — pilotos
- **cars** — carros/monopostos
- **tracks** — circuitos
- **races** — corridas
- **seasons** — temporadas
- **products** — produtos da loja
- **orders** — pedidos e itens

## 📱 Páginas Principais

| Página          | Descrição                           | Auth |
|-----------------|-------------------------------------|------|
| `index.html`    | Home (hero, features)              | ❌   |
| `dashboard.html`| Dashboard de corridas (real-time)  | ✅   |
| `analytics.html`| Análises e KPIs                    | ✅   |
| `equipe.html`   | Gestão de equipe                   | ✅   |
| `grid.html`     | Classificação/standings            | ✅   |
| `pistas.html`   | Cadastro/edição de pistas          | ✅   |
| `loja.html`     | Loja (produtos e carrinho)         | ⚠️   |
| `login.html`    | Autenticação (3 roles)             | ❌   |

## 🐛 Troubleshooting

### Erro: `getaddrinfo ENOTFOUND localhost:3306`
**Causa:** MySQL não está rodando  
**Solução:**
```bash
docker ps                # Verificar se container está rodando
docker start ra-mysql    # Iniciar se parado
```

### Erro: `CORS error` no front-end
**Causa:** Backend não tem CORS habilitado  
**Verificação:** [back-end/src/app.ts](back-end/src/app.ts) — já tem `cors()` middleware

### Token expirado
**Solução:** Refazer login em `login.html`

### Dados não aparecem na loja
**Causa:** Seed não foi executado  
**Solução:**
```bash
cd back-end
npx prisma db seed
```

## 📚 Referências

- [Express.js Docs](https://expressjs.com)
- [Prisma ORM](https://www.prisma.io)
- [Zod Validation](https://zod.dev)
- [JWT.io](https://jwt.io)

## 📄 Licença

Propriedade da **Racing Angels** © 2026

---

**Última atualização:** 16/06/2026  
**Status:** ✅ Backend rodando | 🔗 Front-end integrado | ⏳ MySQL setup necessário
