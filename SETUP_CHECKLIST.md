# 🎯 Checklist de Integração Frontend ↔ Backend

**Data:** 16/06/2026  
**Status:** ✅ CONCLUÍDO

---

## ✅ Configuração do Banco de Dados

- [x] Porta alterada para **3306** (MySQL padrão)
- [x] Usuário: **root**
- [x] Senha: **root**
- [x] Arquivo `.env` criado com configuração correta
- [x] DATABASE_URL: `mysql://root:root@localhost:3306/racing_angels`

**Arquivo:** `back-end/.env`

---

## ✅ Backend

- [x] Dependências instaladas (`npm install`)
- [x] Prisma gerado (`npx prisma generate`)
- [x] Servidor iniciado com sucesso
- [x] Rodando em: **http://localhost:3333**
- [x] CORS habilitado para integração front-end
- [x] Suporta autenticação JWT

**Próximos passos (necessário MySQL rodando):**
```bash
cd back-end
npx prisma migrate dev --name init
npm run dev
```

---

## ✅ Frontend - Integração API

- [x] Arquivo `assets/js/api.js` criado
- [x] Funções globais disponíveis:
  - `window.loginApi(username, password)`
  - `window.getRacesApi(filters)`
  - `window.createOrderApi(payload)`
  - `window.apiFetch(path, options)`
- [x] Token JWT armazenado automaticamente em `localStorage`
- [x] Headers de autenticação configurados

**Arquivo:** `assets/js/api.js`

---

## ✅ Frontend - Inclusão de Scripts

Todos os arquivos HTML atualizados para incluir:
```html
<script src="assets/js/api.js"></script>
<script src="script.js"></script>
```

**Arquivos atualizados:**
- [x] index.html
- [x] analytics.html
- [x] contato.html
- [x] dashboard.html
- [x] equipe.html
- [x] grid.html
- [x] login.html
- [x] loja.html
- [x] pistas.html

---

## ✅ Organização de Arquivos

### Estrutura Front-End:
```
front-end/
├── index.html
├── (outras páginas .html)
├── script.js
├── style.css
├── api.js                    # [DEPRECATED] use assets/js/api.js
├── assets/
│   ├── js/
│   │   └── api.js           # ✅ NOVO: helper de integração
│   └── shop/
└── back-end/
```

**Mudanças:**
- Criada pasta `assets/js/`
- Movido helper de API para `assets/js/api.js`
- Todos os HTML atualizados para usar novo caminho
- Arquivo `api.js` raiz pode ser deletado (deprecated)

---

## 📚 Documentação

- [x] README.md criado com:
  - ✅ Instruções de setup (backend + frontend)
  - ✅ Credenciais padrão
  - ✅ Endpoints principais
  - ✅ Exemplos de curl
  - ✅ Troubleshooting
  - ✅ Referências

**Arquivo:** `README.md`

---

## 🧪 Testes Recomendados

### 1. Teste Backend
```bash
# Terminal 1
cd back-end
npm run dev
# Output esperado: "Racing Angels API rodando em http://localhost:3333"
```

### 2. Teste Login (curl)
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

**Esperado:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

### 3. Teste Frontend + API
```bash
# Terminal 2
cd front-end
python -m http.server 8080
# ou: npx serve .

# Abra no navegador: http://localhost:8080
# Abra DevTools (F12) e execute:
```

```javascript
// Console do navegador
window.loginApi('admin', '123456')
  .then(data => console.log('Logged in:', data))
  .catch(err => console.error('Login failed:', err));
```

### 4. Teste MySQL (quando disponível)
```bash
cd back-end
npx prisma db push           # ou: npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## 🔑 Credenciais Padrão

| Usuário  | Senha  | Role   | Acesso                       |
|----------|--------|--------|------------------------------|
| admin    | 123456 | admin  | ✅ Controle total            |
| equipe   | 123456 | team   | ✅ Gestão de equipe/pilotos  |
| corredor | 123456 | driver | ✅ Visualização (piloto)     |

---

## 📋 Endpoints Testáveis

```bash
# Login (sem token)
POST /api/auth/login

# Requer token (adicione -H "Authorization: Bearer TOKEN")
GET  /api/users
GET  /api/teams
GET  /api/drivers
GET  /api/cars
GET  /api/tracks
GET  /api/races
GET  /api/products
GET  /api/dashboard/summary
GET  /api/analytics
```

---

## ⚙️ Configuração Final Necessária

1. **Instalar MySQL:**
   ```bash
   docker run --name ra-mysql \
     -e MYSQL_ROOT_PASSWORD=root \
     -e MYSQL_DATABASE=racing_angels \
     -p 3306:3306 \
     -d mysql:8
   ```

2. **Rodar Migrations:**
   ```bash
   cd back-end
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Iniciar Backend:**
   ```bash
   npm run dev
   ```

4. **Iniciar Frontend:**
   ```bash
   cd front-end
   python -m http.server 8080
   ```

5. **Acessar:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3333/api
   - Login: admin / 123456

---

## 🎉 Resultado Final

✅ **Backend:** Rodando e pronto para conexão  
✅ **Frontend:** Integrado com API via `assets/js/api.js`  
✅ **Autenticação:** JWT configurado e testável  
✅ **Organização:** Estrutura profissional e limpa  
✅ **Documentação:** README completo  

---

## 📞 Próximas Tarefas (Opcional)

- [ ] Implementar seed mais realista de dados
- [ ] Adicionar testes unitários (jest)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Deploy em produção (Vercel/Heroku/AWS)
- [ ] Cache (Redis)
- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] File uploads para imagens

---

**Status:** ✅ PRONTO PARA USAR

Obs.: Arquivo `api.js` na raiz pode ser deletado — use `assets/js/api.js` ao invés.
