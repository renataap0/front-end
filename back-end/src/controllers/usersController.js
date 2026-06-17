const usersService = require("../services/usersService");
const { asyncHandler } = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (_request, response) => {
  return response.json(await usersService.listUsers());
});

const me = asyncHandler(async (request, response) => {
  return response.json(await usersService.getMe(request.user.id));
});

module.exports = { listUsers, me };
