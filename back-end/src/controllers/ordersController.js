const { orderCreateSchema } = require("../schemas/domainSchemas");
const ordersService = require("../services/ordersService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, parseId } = require("../utils/http");

const listOrders = asyncHandler(async (request, response) => {
  return response.json(await ordersService.listOrders(request.user));
});

const getOrder = asyncHandler(async (request, response) => {
  return response.json(await ordersService.getOrder(parseId(request.params.id), request.user));
});

const createOrder = asyncHandler(async (request, response) => {
  const data = orderCreateSchema.parse(request.body);
  return created(response, await ordersService.createOrder(data, request.user));
});

module.exports = { createOrder, getOrder, listOrders };
