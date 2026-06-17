const { Router } = require("express");
const dashboardController = require("../controllers/dashboardController");

const dashboardRoutes = Router();

dashboardRoutes.get("/summary", dashboardController.summary);

module.exports = { dashboardRoutes };
