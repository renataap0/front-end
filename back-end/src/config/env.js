const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET || "troque_essa_chave",
  databaseUrl: process.env.DATABASE_URL || "mysql://root:root@localhost:3306/racing_angels"
};

module.exports = { env };
