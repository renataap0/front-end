const { execute, insertAndFind, normalizeBoolean, rows, updateAndFind } = require("./helpers");
const { mapProduct } = require("./mappers");

const productColumns = `
  id,
  nome AS name,
  descricao AS description,
  preco AS price,
  estoque AS stock,
  imagem_url AS imageUrl,
  ativo AS active,
  criado_em AS createdAt,
  atualizado_em AS updatedAt
`;

const productColumnMap = {
  name: "nome",
  description: "descricao",
  price: "preco",
  stock: "estoque",
  imageUrl: "imagem_url",
  active: "ativo"
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
    where.push("ativo = ?");
    params.push(String(query.active) === "true" ? 1 : 0);
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
    `SELECT ${productColumns} FROM produtos WHERE ativo = 1 AND id IN (${placeholders})${connection ? " FOR UPDATE" : ""}`,
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
  return execute(
    "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
    [quantity, id, quantity],
    connection
  );
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
