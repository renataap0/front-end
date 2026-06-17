const { Router } = require("express");
const usersController = require("../controllers/usersController");
const { requireRole } = require("../middlewares/requireRole");

const usersRoutes = Router();

usersRoutes.get("/", requireRole("admin"), usersController.listUsers);
usersRoutes.get("/me", usersController.me);

module.exports = { usersRoutes };
