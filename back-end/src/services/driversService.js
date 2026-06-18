const carsDao = require("../daos/carsDao");
const driversDao = require("../daos/driversDao");
const racesDao = require("../daos/racesDao");
const { AppError } = require("../utils/AppError");

function assertCanManageDriver(user, driverTeamId) {
  if (user.role === "admin") {
    return;
  }

  if (user.role === "team" && user.teamId === driverTeamId) {
    return;
  }

  throw new AppError("Usuario sem permissao para gerenciar este piloto.", 403);
}

async function attachDriverCars(drivers) {
  const cars = await carsDao.listCarsByDriverIds(drivers.map((driver) => driver.id));

  return drivers.map((driver) => ({
    ...driver,
    cars: cars.filter((car) => car.driverId === driver.id)
  }));
}

async function listDrivers(query) {
  const drivers = await driversDao.listDrivers(query);
  return attachDriverCars(drivers);
}

async function getDriver(id) {
  const driver = await driversDao.findDriverById(id);

  if (!driver) {
    throw new AppError("Piloto nao encontrado.", 404);
  }

  const [[driverWithCars], races] = await Promise.all([
    attachDriverCars([driver]),
    racesDao.listRacesByDriverIds([id])
  ]);

  return {
    ...driverWithCars,
    races
  };
}

async function createDriver(data, user) {
  if (user.role !== "admin") {
    throw new AppError("Apenas admin pode cadastrar pilotos.", 403);
  }

  if (!data.teamId) {
    throw new AppError("teamId e obrigatorio para cadastrar piloto.", 400);
  }

  return driversDao.createDriver(data);
}

async function updateDriver(id, data, user) {
  const driver = await driversDao.findDriverById(id);

  if (!driver) {
    throw new AppError("Piloto nao encontrado.", 404);
  }

  assertCanManageDriver(user, driver.teamId);

  const safeData = user.role === "team" ? { ...data, teamId: driver.teamId } : data;
  return driversDao.updateDriver(id, safeData);
}

async function deleteDriver(id, user) {
  if (user.role !== "admin") {
    throw new AppError("Apenas admin pode excluir pilotos.", 403);
  }

  const driver = await driversDao.findDriverById(id);

  if (!driver) {
    throw new AppError("Piloto nao encontrado.", 404);
  }

  return driversDao.deleteDriver(id);
}

module.exports = { createDriver, deleteDriver, getDriver, listDrivers, updateDriver };
