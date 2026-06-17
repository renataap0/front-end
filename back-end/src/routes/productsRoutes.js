const { Router } = require("express");
const productsController = require("../controllers/productsController");
const { requireRole } = require("../middlewares/requireRole");

const productsRoutes = Router();

productsRoutes.get("/", productsController.listProducts);
productsRoutes.get("/:id", productsController.getProduct);
productsRoutes.post("/", requireRole("admin"), productsController.createProduct);
productsRoutes.put("/:id", requireRole("admin"), productsController.updateProduct);
productsRoutes.delete("/:id", requireRole("admin"), productsController.deleteProduct);

module.exports = { productsRoutes };
