const {
  seasonCreateSchema,
  seasonRoundCreateSchema,
  seasonRoundLapCreateSchema
} = require("../schemas/domainSchemas");
const seasonsService = require("../services/seasonsService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, parseId } = require("../utils/http");

const listSeasons = asyncHandler(async (_request, response) => {
  return response.json(await seasonsService.listSeasons());
});

const createSeason = asyncHandler(async (request, response) => {
  const data = seasonCreateSchema.parse(request.body);
  return created(response, await seasonsService.createSeason(data, request.user));
});

const getSeason = asyncHandler(async (request, response) => {
  return response.json(await seasonsService.getSeason(parseId(request.params.id)));
});

const createSeasonRound = asyncHandler(async (request, response) => {
  const data = seasonRoundCreateSchema.parse(request.body);
  return created(response, await seasonsService.createSeasonRound(parseId(request.params.id), data, request.user));
});

const createSeasonRoundLap = asyncHandler(async (request, response) => {
  const data = seasonRoundLapCreateSchema.parse(request.body);
  return created(response, await seasonsService.createSeasonRoundLap(parseId(request.params.id), data, request.user));
});

const listSeasonRoundLaps = asyncHandler(async (request, response) => {
  return response.json(await seasonsService.listSeasonRoundLaps(parseId(request.params.id)));
});

module.exports = {
  createSeason,
  createSeasonRound,
  createSeasonRoundLap,
  getSeason,
  listSeasonRoundLaps,
  listSeasons
};
