const { Router } = require("express");
const ordersController = require("../controllers/ordersController");

const ordersRoutes = Router();

ordersRoutes.get("/", ordersController.listOrders);
ordersRoutes.get("/:id", ordersController.getOrder);
ordersRoutes.post("/", ordersController.createOrder);

module.exports = { ordersRoutes };
