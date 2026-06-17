const { loginSchema } = require("../schemas/authSchemas");
const authService = require("../services/authService");
const { asyncHandler } = require("../utils/asyncHandler");

const login = asyncHandler(async (request, response) => {
  const data = loginSchema.parse(request.body);
  return response.json(await authService.login(data.username, data.password));
});

module.exports = { login };
