# Guia para executar o Racing Angels

Este guia mostra como instalar, configurar e iniciar o projeto no Windows usando PowerShell.

## 1. Programas necessarios

Instale:

- Node.js 18 ou superior: https://nodejs.org/
- MySQL Server, MySQL Workbench ou XAMPP com MySQL
- Um navegador, como Google Chrome, Edge ou Firefox

Confirme a instalacao do Node.js:

```powershell
node --version
npm --version
```

## 2. Abrir o projeto

No PowerShell:

```powershell
cd C:\Temp\racing_angels
```

## 3. Instalar as dependencias

Instale as dependencias do front-end:

```powershell
npm.cmd install
```

Depois, instale as dependencias do back-end:

```powershell
cd back-end
npm.cmd install
```

Esses comandos precisam ser executados apenas na primeira instalacao ou quando as dependencias forem alteradas.

## 4. Configurar o banco de dados

Confirme que existe o arquivo:

```text
C:\Temp\racing_angels\back-end\.env
```

O conteudo deve ser semelhante a:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=corridapro
PORT=3000
JWT_SECRET=gere_uma_chave_aleatoria_com_32_ou_mais_caracteres
```

Altere `DB_PASSWORD` para a senha do seu MySQL.

Se estiver usando XAMPP sem senha:

```env
DB_PASSWORD=
```

## 5. Preparar o banco

Inicie o MySQL pelo Windows, MySQL Workbench ou painel do XAMPP.

Depois execute:

```powershell
cd C:\Temp\racing_angels\back-end
npm.cmd run db:setup
```

Esse comando:

- Cria o banco `corridapro`
- Cria as tabelas e views
- Insere os dados de demonstracao
- Configura as senhas dos usuarios

Atencao: `db:setup` recria as tabelas e apaga os dados anteriores. Execute somente na instalacao inicial ou para restaurar a demonstracao.

## 6. Iniciar o projeto

Abra dois terminais PowerShell e mantenha os dois abertos.

### Terminal 1: back-end

```powershell
cd C:\Temp\racing_angels\back-end
npm.cmd start
```

Resultado esperado:

```text
Racing Angels API rodando em http://localhost:3000
```

Teste a API no navegador:

```text
http://localhost:3000/health
```

Resposta esperada:

```json
{"status":"ok"}
```

### Terminal 2: front-end

```powershell
cd C:\Temp\racing_angels
npm.cmd run dev
```

Abra o site:

```text
http://localhost:8080/front-end/index.html
```

## 7. Usuarios para demonstracao

| Perfil | Usuario | Senha |
| --- | --- | --- |
| Administrador | `admin` | `123456` |
| Equipe | `equipe` | `123456` |
| Corredor | `corredor` | `123456` |

## 8. Checklist para o dia da apresentacao

1. Inicie o MySQL.
2. Abra um terminal e execute o back-end.
3. Acesse `http://localhost:3000/health`.
4. Abra outro terminal e execute o front-end.
5. Acesse `http://localhost:8080/front-end/index.html`.
6. Entre com `admin` e senha `123456`.
7. Mantenha os dois terminais abertos durante a apresentacao.

No dia da apresentacao, normalmente nao sera necessario executar `npm install` nem `npm run db:setup` novamente.

## 9. Solucao de problemas

### Erro ao conectar no banco

Verifique:

- Se o MySQL esta iniciado
- Se usuario e senha do `.env` estao corretos
- Se a porta do MySQL e `3306`

### Login nao funciona

Restaure os dados de demonstracao:

```powershell
cd C:\Temp\racing_angels\back-end
npm.cmd run db:setup
```

Depois reinicie o back-end.

### Porta 3000 ou 8080 ocupada

Feche outras instancias do projeto e tente novamente:

```powershell
netstat -ano | findstr ":3000 :8080"
```

### O site abre, mas nao carrega dados

Confirme que:

- O back-end continua aberto
- `http://localhost:3000/health` responde
- O login foi realizado
- O MySQL continua iniciado
