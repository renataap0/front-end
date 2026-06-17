const dashboardService = require("../services/dashboardService");
const { asyncHandler } = require("../utils/asyncHandler");

const summary = asyncHandler(async (_request, response) => {
  return response.json(await dashboardService.getDashboardSummary());
});

module.exports = { summary };
