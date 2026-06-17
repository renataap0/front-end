const { driverCreateSchema, driverUpdateSchema } = require("../schemas/domainSchemas");
const driversService = require("../services/driversService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listDrivers = asyncHandler(async (request, response) => {
  return response.json(await driversService.listDrivers(request.query));
});

const getDriver = asyncHandler(async (request, response) => {
  return response.json(await driversService.getDriver(parseId(request.params.id)));
});

const createDriver = asyncHandler(async (request, response) => {
  const data = driverCreateSchema.parse(request.body);
  return created(response, await driversService.createDriver(data, request.user));
});

const updateDriver = asyncHandler(async (request, response) => {
  const data = driverUpdateSchema.parse(request.body);
  return response.json(await driversService.updateDriver(parseId(request.params.id), data, request.user));
});

const deleteDriver = asyncHandler(async (request, response) => {
  await driversService.deleteDriver(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createDriver, deleteDriver, getDriver, listDrivers, updateDriver };
