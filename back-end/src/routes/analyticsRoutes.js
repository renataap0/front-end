const { Router } = require("express");
const analyticsController = require("../controllers/analyticsController");

const analyticsRoutes = Router();

analyticsRoutes.get("/", analyticsController.getAnalytics);
analyticsRoutes.get("/drivers", analyticsController.getDriversAnalytics);
analyticsRoutes.get("/tracks", analyticsController.getTracksAnalytics);
analyticsRoutes.get("/cars", analyticsController.getCarsAnalytics);
analyticsRoutes.get("/rankings", analyticsController.getRankings);

module.exports = { analyticsRoutes };
