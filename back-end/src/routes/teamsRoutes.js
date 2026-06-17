const { Router } = require("express");
const teamsController = require("../controllers/teamsController");
const { requireRole } = require("../middlewares/requireRole");

const teamsRoutes = Router();

teamsRoutes.get("/", teamsController.listTeams);
teamsRoutes.post("/", requireRole("admin"), teamsController.createTeam);
teamsRoutes.put("/:id", requireRole("admin"), teamsController.updateTeam);
teamsRoutes.delete("/:id", requireRole("admin"), teamsController.deleteTeam);

module.exports = { teamsRoutes };
