const { Router } = require("express");
const authController = require("../controllers/authController");

const authRoutes = Router();

authRoutes.post("/login", authController.login);

module.exports = { authRoutes };
