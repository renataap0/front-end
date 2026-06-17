const carsDao = require("../daos/carsDao");
const racesDao = require("../daos/racesDao");
const { AppError } = require("../utils/AppError");

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
