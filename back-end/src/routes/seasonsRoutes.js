const { Router } = require("express");
const seasonsController = require("../controllers/seasonsController");
const { requireRole } = require("../middlewares/requireRole");

const seasonsRoutes = Router();
const seasonRoundsRoutes = Router();

seasonsRoutes.get("/", seasonsController.listSeasons);
seasonsRoutes.post("/", requireRole("admin", "team"), seasonsController.createSeason);
seasonsRoutes.get("/:id", seasonsController.getSeason);
seasonsRoutes.post("/:id/rounds", requireRole("admin", "team"), seasonsController.createSeasonRound);

seasonRoundsRoutes.post("/:id/laps/bulk", requireRole("admin", "team"), seasonsController.createSeasonRoundLaps);
seasonRoundsRoutes.post("/:id/laps", requireRole("admin", "team"), seasonsController.createSeasonRoundLap);
seasonRoundsRoutes.get("/:id/laps", seasonsController.listSeasonRoundLaps);

module.exports = { seasonRoundsRoutes, seasonsRoutes };
