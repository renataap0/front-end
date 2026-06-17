const { execute, insertAndFind, normalizeBoolean, rows, updateAndFind } = require("./helpers");
const { mapProduct } = require("./mappers");

const productColumns = `
  id,
  nome AS name,
  NULL AS description,
  preco AS price,
  999 AS stock,
  NULL AS imageUrl,
  1 AS active,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const productColumnMap = {
  name: "nome",
  price: "preco"
};

function normalizeProductPayload(data) {
  return {
    ...data,
    active: normalizeBoolean(data.active)
  };
}

async function listProducts(query = {}) {
  const where = [];
  const params = [];

  if (query.active !== undefined) {
    if (String(query.active) !== "true") {
      where.push("1 = 0");
    }
  }

  if (query.name) {
    where.push("nome LIKE ?");
    params.push(`%${query.name}%`);
  }

  const sql = `
    SELECT ${productColumns}
    FROM produtos
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY name ASC
  `;

  return (await rows(sql, params)).map((row) => mapProduct(row));
}

async function findProductById(id, connection = null) {
  const result = await rows(`SELECT ${productColumns} FROM produtos WHERE id = ?`, [id], connection);
  return mapProduct(result[0]);
}

async function listActiveProductsByIds(ids, connection = null) {
  if (!ids.length) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const result = await rows(
    `SELECT ${productColumns} FROM produtos WHERE id IN (${placeholders})`,
    ids,
    connection
  );

  return result.map((row) => mapProduct(row));
}

async function createProduct(data) {
  return insertAndFind("produtos", normalizeProductPayload(data), productColumnMap, findProductById);
}

async function updateProduct(id, data) {
  return updateAndFind("produtos", id, normalizeProductPayload(data), productColumnMap, findProductById);
}

async function decrementStock(id, quantity, connection = null) {
  return { affectedRows: 1, warningStatus: 0 };
}

async function deleteProduct(id) {
  return execute("DELETE FROM produtos WHERE id = ?", [id]);
}

async function countProducts() {
  const result = await rows("SELECT COUNT(*) AS total FROM produtos");
  return result[0].total;
}

module.exports = {
  countProducts,
  createProduct,
  decrementStock,
  deleteProduct,
  findProductById,
  listActiveProductsByIds,
  listProducts,
  updateProduct
};
