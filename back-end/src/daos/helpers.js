const { pool } = require("../config/database");

async function rows(sql, params = [], connection = null) {
  const [result] = await (connection || pool).execute(sql, params);
  return result;
}

async function execute(sql, params = [], connection = null) {
  const [result] = await (connection || pool).execute(sql, params);
  return result;
}

function cleanUndefined(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function toMysqlDate(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace("T", " ");
}

function toIso(value) {
  if (!value) {
    return value;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function normalizeBoolean(value) {
  if (value === undefined) {
    return undefined;
  }

  return value ? 1 : 0;
}

function buildInsert(table, data, columnMap) {
  const payload = cleanUndefined(data);
  const fields = Object.keys(payload).filter((field) => columnMap[field]);

  const columns = fields.map((field) => columnMap[field]);
  const placeholders = fields.map(() => "?");
  const values = fields.map((field) => payload[field]);

  return {
    sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
    values
  };
}

function buildUpdate(table, id, data, columnMap) {
  const payload = cleanUndefined(data);
  const fields = Object.keys(payload).filter((field) => columnMap[field]);

  if (!fields.length) {
    return null;
  }

  const assignments = fields.map((field) => `${columnMap[field]} = ?`);
  const values = fields.map((field) => payload[field]);

  return {
    sql: `UPDATE ${table} SET ${assignments.join(", ")} WHERE id = ?`,
    values: [...values, id]
  };
}

async function insertAndFind(table, data, columnMap, findById, connection = null) {
  const statement = buildInsert(table, data, columnMap);
  const result = await execute(statement.sql, statement.values, connection);
  return findById(result.insertId, connection);
}

async function updateAndFind(table, id, data, columnMap, findById, connection = null) {
  const statement = buildUpdate(table, id, data, columnMap);

  if (statement) {
    await execute(statement.sql, statement.values, connection);
  }

  return findById(id, connection);
}

function inClause(values) {
  return values.map(() => "?").join(", ");
}

module.exports = {
  buildInsert,
  buildUpdate,
  cleanUndefined,
  execute,
  inClause,
  insertAndFind,
  normalizeBoolean,
  rows,
  toIso,
  toMysqlDate,
  updateAndFind
};
