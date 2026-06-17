const cors = require("cors");
const express = require("express");
const { analyticsRoutes } = require("./routes/analyticsRoutes");
const { authRoutes } = require("./routes/authRoutes");
const { carsRoutes } = require("./routes/carsRoutes");
const { dashboardRoutes } = require("./routes/dashboardRoutes");
const { driversRoutes } = require("./routes/driversRoutes");
const { ordersRoutes } = require("./routes/ordersRoutes");
const { productsRoutes } = require("./routes/productsRoutes");
const { racesRoutes } = require("./routes/racesRoutes");
const { seasonRoundsRoutes, seasonsRoutes } = require("./routes/seasonsRoutes");
const { teamsRoutes } = require("./routes/teamsRoutes");
const { tracksRoutes } = require("./routes/tracksRoutes");
const { usersRoutes } = require("./routes/usersRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { AppError } = require("./utils/AppError");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/auth", authRoutes);

app.use("/api", authMiddleware);
app.use("/api/users", usersRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/tracks", tracksRoutes);
app.use("/api/races", racesRoutes);
app.use("/api/seasons", seasonsRoutes);
app.use("/api/season-rounds", seasonRoundsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_request, _response, next) => {
  next(new AppError("Rota nao encontrada.", 404));
});

app.use(errorMiddleware);

module.exports = { app };
