const { raceCreateSchema, raceUpdateSchema } = require("../schemas/domainSchemas");
const racesService = require("../services/racesService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listRaces = asyncHandler(async (request, response) => {
  return response.json(await racesService.listRaces(request.query));
});

const getRace = asyncHandler(async (request, response) => {
  return response.json(await racesService.getRace(parseId(request.params.id)));
});

const createRace = asyncHandler(async (request, response) => {
  const data = raceCreateSchema.parse(request.body);
  return created(response, await racesService.createRace(data, request.user));
});

const updateRace = asyncHandler(async (request, response) => {
  const data = raceUpdateSchema.parse(request.body);
  return response.json(await racesService.updateRace(parseId(request.params.id), data, request.user));
});

const deleteRace = asyncHandler(async (request, response) => {
  await racesService.deleteRace(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createRace, deleteRace, getRace, listRaces, updateRace };
