const dotenv = require("dotenv");

dotenv.config();

function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username || "root"),
    password: decodeURIComponent(url.password || ""),
    name: url.pathname.replace(/^\//, "") || "corridapro"
  };
}

const databaseUrlConfig = parseDatabaseUrl(process.env.DATABASE_URL);
const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret || jwtSecret === "troque_essa_chave" || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET deve ser configurado com pelo menos 32 caracteres.");
}

const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret,
  db: {
    host: process.env.DB_HOST || databaseUrlConfig?.host || "localhost",
    port: Number(process.env.DB_PORT || databaseUrlConfig?.port || 3306),
    user: process.env.DB_USER || databaseUrlConfig?.user || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : databaseUrlConfig?.password || "root",
    name: process.env.DB_NAME || databaseUrlConfig?.name || "corridapro",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10
  }
};

module.exports = { env };
