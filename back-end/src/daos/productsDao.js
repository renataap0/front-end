const { execute, insertAndFind, normalizeBoolean, rows, updateAndFind } = require("./helpers");
const { mapProduct } = require("./mappers");

const productColumns = `
  id,
  name,
  description,
  price,
  stock,
  image_url AS imageUrl,
  active,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const productColumnMap = {
  name: "name",
  description: "description",
  price: "price",
  stock: "stock",
  imageUrl: "image_url",
  active: "active"
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
    where.push("active = ?");
    params.push(String(query.active) === "true" ? 1 : 0);
  }

  if (query.name) {
    where.push("name LIKE ?");
    params.push(`%${query.name}%`);
  }

  const sql = `
    SELECT ${productColumns}
    FROM products
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY name ASC
  `;

  return (await rows(sql, params)).map((row) => mapProduct(row));
}

async function findProductById(id, connection = null) {
  const result = await rows(`SELECT ${productColumns} FROM products WHERE id = ?`, [id], connection);
  return mapProduct(result[0]);
}

async function listActiveProductsByIds(ids, connection = null) {
  if (!ids.length) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const result = await rows(
    `SELECT ${productColumns} FROM products WHERE active = 1 AND id IN (${placeholders})`,
    ids,
    connection
  );

  return result.map((row) => mapProduct(row));
}

async function createProduct(data) {
  return insertAndFind("products", normalizeProductPayload(data), productColumnMap, findProductById);
}

async function updateProduct(id, data) {
  return updateAndFind("products", id, normalizeProductPayload(data), productColumnMap, findProductById);
}

async function decrementStock(id, quantity, connection = null) {
  return execute("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, id], connection);
}

async function deleteProduct(id) {
  return execute("DELETE FROM products WHERE id = ?", [id]);
}

async function countProducts() {
  const result = await rows("SELECT COUNT(*) AS total FROM products");
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
