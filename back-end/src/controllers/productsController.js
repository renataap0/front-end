const { productCreateSchema, productUpdateSchema } = require("../schemas/domainSchemas");
const productsService = require("../services/productsService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listProducts = asyncHandler(async (request, response) => {
  return response.json(await productsService.listProducts(request.query));
});

const getProduct = asyncHandler(async (request, response) => {
  return response.json(await productsService.getProduct(parseId(request.params.id)));
});

const createProduct = asyncHandler(async (request, response) => {
  const data = productCreateSchema.parse(request.body);
  return created(response, await productsService.createProduct(data, request.user));
});

const updateProduct = asyncHandler(async (request, response) => {
  const data = productUpdateSchema.parse(request.body);
  return response.json(await productsService.updateProduct(parseId(request.params.id), data, request.user));
});

const deleteProduct = asyncHandler(async (request, response) => {
  await productsService.deleteProduct(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createProduct, deleteProduct, getProduct, listProducts, updateProduct };
