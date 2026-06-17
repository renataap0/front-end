const { Router } = require("express");
const racesController = require("../controllers/racesController");
const { requireRole } = require("../middlewares/requireRole");

const racesRoutes = Router();

racesRoutes.get("/", racesController.listRaces);
racesRoutes.get("/:id", racesController.getRace);
racesRoutes.post("/", requireRole("admin", "team"), racesController.createRace);
racesRoutes.put("/:id", requireRole("admin", "team"), racesController.updateRace);
racesRoutes.delete("/:id", requireRole("admin"), racesController.deleteRace);

module.exports = { racesRoutes };
