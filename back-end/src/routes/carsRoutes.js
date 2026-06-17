const { Router } = require("express");
const carsController = require("../controllers/carsController");
const { requireRole } = require("../middlewares/requireRole");

const carsRoutes = Router();

carsRoutes.get("/", carsController.listCars);
carsRoutes.get("/:id", carsController.getCar);
carsRoutes.post("/", requireRole("admin"), carsController.createCar);
carsRoutes.put("/:id", requireRole("admin", "team"), carsController.updateCar);
carsRoutes.delete("/:id", requireRole("admin"), carsController.deleteCar);

module.exports = { carsRoutes };
