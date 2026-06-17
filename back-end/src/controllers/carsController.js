const { carCreateSchema, carUpdateSchema } = require("../schemas/domainSchemas");
const carsService = require("../services/carsService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listCars = asyncHandler(async (request, response) => {
  return response.json(await carsService.listCars(request.query));
});

const getCar = asyncHandler(async (request, response) => {
  return response.json(await carsService.getCar(parseId(request.params.id)));
});

const createCar = asyncHandler(async (request, response) => {
  const data = carCreateSchema.parse(request.body);
  return created(response, await carsService.createCar(data, request.user));
});

const updateCar = asyncHandler(async (request, response) => {
  const data = carUpdateSchema.parse(request.body);
  return response.json(await carsService.updateCar(parseId(request.params.id), data, request.user));
});

const deleteCar = asyncHandler(async (request, response) => {
  await carsService.deleteCar(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createCar, deleteCar, getCar, listCars, updateCar };
