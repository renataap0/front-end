const { trackCreateSchema, trackUpdateSchema } = require("../schemas/domainSchemas");
const tracksService = require("../services/tracksService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listTracks = asyncHandler(async (request, response) => {
  return response.json(await tracksService.listTracks(request.query));
});

const getTrack = asyncHandler(async (request, response) => {
  return response.json(await tracksService.getTrack(parseId(request.params.id)));
});

const createTrack = asyncHandler(async (request, response) => {
  const data = trackCreateSchema.parse(request.body);
  return created(response, await tracksService.createTrack(data, request.user));
});

const updateTrack = asyncHandler(async (request, response) => {
  const data = trackUpdateSchema.parse(request.body);
  return response.json(await tracksService.updateTrack(parseId(request.params.id), data, request.user));
});

const deleteTrack = asyncHandler(async (request, response) => {
  await tracksService.deleteTrack(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createTrack, deleteTrack, getTrack, listTracks, updateTrack };
