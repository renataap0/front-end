const { teamCreateSchema, teamUpdateSchema } = require("../schemas/domainSchemas");
const teamsService = require("../services/teamsService");
const { asyncHandler } = require("../utils/asyncHandler");
const { created, noContent, parseId } = require("../utils/http");

const listTeams = asyncHandler(async (request, response) => {
  return response.json(await teamsService.listTeams(request.query));
});

const createTeam = asyncHandler(async (request, response) => {
  const data = teamCreateSchema.parse(request.body);
  return created(response, await teamsService.createTeam(data, request.user));
});

const updateTeam = asyncHandler(async (request, response) => {
  const data = teamUpdateSchema.parse(request.body);
  return response.json(await teamsService.updateTeam(parseId(request.params.id), data, request.user));
});

const deleteTeam = asyncHandler(async (request, response) => {
  await teamsService.deleteTeam(parseId(request.params.id), request.user);
  return noContent(response);
});

module.exports = { createTeam, deleteTeam, listTeams, updateTeam };
