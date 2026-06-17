const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../utils/asyncHandler");

const getAnalytics = asyncHandler(async (_request, response) => {
  return response.json(await analyticsService.getAnalytics());
});

const getDriversAnalytics = asyncHandler(async (_request, response) => {
  return response.json(await analyticsService.getDriverAnalytics());
});

const getTracksAnalytics = asyncHandler(async (_request, response) => {
  return response.json(await analyticsService.getTrackAnalytics());
});

const getCarsAnalytics = asyncHandler(async (_request, response) => {
  return response.json(await analyticsService.getCarAnalytics());
});

const getRankings = asyncHandler(async (_request, response) => {
  return response.json(await analyticsService.getRankings());
});

module.exports = { getAnalytics, getCarsAnalytics, getDriversAnalytics, getRankings, getTracksAnalytics };
