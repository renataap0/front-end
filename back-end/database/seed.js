const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { env } = require("../src/config/env");

function parseConnection(includeDatabase = false) {
  return {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: includeDatabase ? env.db.name : undefined,
    multipleStatements: true,
    decimalNumbers: true
  };
}

function escapeIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error("DB_NAME precisa conter apenas letras, numeros ou underscore.");
  }

  return `\`${identifier}\``;
}

async function main() {
  const databaseName = escapeIdentifier(env.db.name);
  const schema = fs.readFileSync(path.resolve(__dirname, "schema.sql"), "utf8")
    .replace(/CREATE DATABASE IF NOT EXISTS\s+`?corridapro`?/i, `CREATE DATABASE IF NOT EXISTS ${databaseName}`)
    .replace(/USE\s+`?corridapro`?\s*;/i, `USE ${databaseName};`);
  const connection = await mysql.createConnection(parseConnection(false));

  await connection.query(schema);

  const passwordHash = await bcrypt.hash("123456", 10);

  await connection.execute(
    `
      UPDATE ${escapeIdentifier(env.db.name)}.usuarios
      SET senha_hash = ?
      WHERE nome_usuario IN ('admin', 'equipe', 'corredor')
    `,
    [passwordHash]
  );

  await connection.end();
  console.log(`Banco ${env.db.name} criado e populado com sucesso.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
