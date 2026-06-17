const productsDao = require("../daos/productsDao");
const { AppError } = require("../utils/AppError");
const { serializeProduct } = require("../utils/serializers");

async function listProducts(query) {
  const products = await productsDao.listProducts(query);
  return products.map(serializeProduct);
}

async function getProduct(id) {
  const product = await productsDao.findProductById(id);

  if (!product) {
    throw new AppError("Produto nao encontrado.", 404);
  }

  return serializeProduct(product);
}

function assertAdmin(user) {
  if (user.role !== "admin") {
    throw new AppError("Apenas admin pode gerenciar produtos.", 403);
  }
}

async function createProduct(data, user) {
  assertAdmin(user);
  return serializeProduct(await productsDao.createProduct(data));
}

async function updateProduct(id, data, user) {
  assertAdmin(user);
  const product = await productsDao.updateProduct(id, data);

  if (!product) {
    throw new AppError("Produto nao encontrado.", 404);
  }

  return serializeProduct(product);
}

async function deleteProduct(id, user) {
  assertAdmin(user);
  return productsDao.deleteProduct(id);
}

module.exports = { createProduct, deleteProduct, getProduct, listProducts, updateProduct };
