const { Router } = require("express");
const tracksController = require("../controllers/tracksController");
const { requireRole } = require("../middlewares/requireRole");

const tracksRoutes = Router();

tracksRoutes.get("/", tracksController.listTracks);
tracksRoutes.get("/:id", tracksController.getTrack);
tracksRoutes.post("/", requireRole("admin", "team"), tracksController.createTrack);
tracksRoutes.put("/:id", requireRole("admin", "team"), tracksController.updateTrack);
tracksRoutes.delete("/:id", requireRole("admin", "team"), tracksController.deleteTrack);

module.exports = { tracksRoutes };
