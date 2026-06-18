const carsDao = require("../daos/carsDao");
const driversDao = require("../daos/driversDao");
const racesDao = require("../daos/racesDao");
const { AppError } = require("../utils/AppError");

async function assertDriverBelongsToTeam(driverId, teamId) {
  if (!driverId) {
    return;
  }

  const driver = await driversDao.findDriverPlainById(driverId);

  if (!driver) {
    throw new AppError("Piloto nao encontrado.", 404);
  }

  if (driver.teamId !== teamId) {
    throw new AppError("O piloto deve pertencer a equipe do carro.", 400);
  }
}

async function listCars(query) {
  return carsDao.listCars(query);
}

async function getCar(id) {
  const car = await carsDao.findCarById(id);

  if (!car) {
    throw new AppError("Carro nao encontrado.", 404);
  }

  car.races = await racesDao.listRacesByCarIds([id]);
  return car;
}

async function createCar(data, user) {
  if (user.role !== "admin") {
    throw new AppError("Apenas admin pode cadastrar carros.", 403);
  }

  await assertDriverBelongsToTeam(data.driverId, data.teamId);
  return carsDao.createCar(data);
}

async function updateCar(id, data, user) {
  const currentCar = await carsDao.findCarById(id);

  if (!currentCar) {
    throw new AppError("Carro nao encontrado.", 404);
  }

  if (user.role === "team" && user.teamId !== currentCar.teamId) {
    throw new AppError("Usuario sem permissao para editar este carro.", 403);
  }

  const safeData = user.role === "team" ? { model: data.model } : data;
  const candidate = { ...currentCar, ...safeData };

  await assertDriverBelongsToTeam(candidate.driverId, candidate.teamId);
  const car = await carsDao.updateCar(id, safeData);

  if (!car) {
    throw new AppError("Carro nao encontrado.", 404);
  }

  return car;
}

async function deleteCar(id, user) {
  if (user.role !== "admin") {
    throw new AppError("Apenas admin pode excluir carros.", 403);
  }

  return carsDao.deleteCar(id);
}

module.exports = { createCar, deleteCar, getCar, listCars, updateCar };
