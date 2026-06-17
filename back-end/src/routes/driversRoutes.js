const { Router } = require("express");
const driversController = require("../controllers/driversController");
const { requireRole } = require("../middlewares/requireRole");

const driversRoutes = Router();

driversRoutes.get("/", driversController.listDrivers);
driversRoutes.get("/:id", driversController.getDriver);
driversRoutes.post("/", requireRole("admin"), driversController.createDriver);
driversRoutes.put("/:id", requireRole("admin", "team"), driversController.updateDriver);
driversRoutes.delete("/:id", requireRole("admin"), driversController.deleteDriver);

module.exports = { driversRoutes };
