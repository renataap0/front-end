const carsDao = require("../daos/carsDao");
const driversDao = require("../daos/driversDao");
const racesDao = require("../daos/racesDao");
const { AppError } = require("../utils/AppError");

async function assertTeamOwnsRace(user, raceId) {
  const race = await racesDao.findRacePlainById(raceId);

  if (!race) {
    throw new AppError("Corrida nao encontrada.", 404);
  }

  if (user.role === "admin") {
    return race;
  }

  if (user.role === "team" && user.teamId === race.teamId) {
    return race;
  }

  throw new AppError("Usuario sem permissao para gerenciar esta corrida.", 403);
}

async function assertRaceEntities(data, user) {
  const teamId = user.role === "team" ? user.teamId : data.teamId;

  if (!teamId) {
    throw new AppError("teamId e obrigatorio para criar corrida.", 400);
  }

  const [driver, car] = await Promise.all([
    driversDao.findDriverPlainById(data.driverId),
    data.carId ? carsDao.findCarPlainById(data.carId) : Promise.resolve(null)
  ]);

  if (!driver) {
    throw new AppError("Piloto nao encontrado.", 404);
  }

  if (driver.teamId !== teamId) {
    throw new AppError("Piloto deve pertencer a equipe da corrida.", 400);
  }

  if (data.carId) {
    if (!car) {
      throw new AppError("Carro nao encontrado.", 404);
    }

    if (car.teamId !== teamId) {
      throw new AppError("Carro deve pertencer a equipe da corrida.", 400);
    }

    if (car.driverId && car.driverId !== driver.id) {
      throw new AppError("O carro selecionado pertence a outro piloto.", 400);
    }
  }

  return teamId;
}

async function listRaces(query) {
  return racesDao.listRaces(query);
}

async function getRace(id) {
  const race = await racesDao.findRaceById(id);

  if (!race) {
    throw new AppError("Corrida nao encontrada.", 404);
  }

  return race;
}

async function createRace(data, user) {
  if (!["admin", "team"].includes(user.role)) {
    throw new AppError("Usuario sem permissao para criar corridas.", 403);
  }

  const teamId = await assertRaceEntities(data, user);
  return racesDao.createRace({
    ...data,
    teamId,
    laps: data.laps || 1,
    bestLapMs: data.bestLapMs || data.durationMs,
    lastLapMs: data.lastLapMs || data.durationMs
  });
}

async function updateRace(id, data, user) {
  if (!["admin", "team"].includes(user.role)) {
    throw new AppError("Usuario sem permissao para editar corridas.", 403);
  }

  const currentRace = await assertTeamOwnsRace(user, id);
  const candidate = {
    ...currentRace,
    ...data,
    teamId: user.role === "team" ? currentRace.teamId : data.teamId ?? currentRace.teamId
  };

  await assertRaceEntities(candidate, user);
  return racesDao.updateRace(id, { ...data, teamId: candidate.teamId });
}

async function deleteRace(id, user) {
  if (user.role !== "admin") {
    throw new AppError("Team e driver nao podem excluir corridas.", 403);
  }

  return racesDao.deleteRace(id);
}

module.exports = { createRace, deleteRace, getRace, listRaces, updateRace };
