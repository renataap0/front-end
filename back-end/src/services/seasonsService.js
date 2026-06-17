const seasonsDao = require("../daos/seasonsDao");
const { AppError } = require("../utils/AppError");

function assertCanWriteSeason(user) {
  if (!["admin", "team"].includes(user.role)) {
    throw new AppError("Usuario sem permissao para alterar temporadas.", 403);
  }
}

async function listSeasons() {
  return seasonsDao.listSeasons();
}

async function createSeason(data, user) {
  assertCanWriteSeason(user);
  return seasonsDao.createSeason(data);
}

async function getSeason(id) {
  const season = await seasonsDao.findSeasonById(id);

  if (!season) {
    throw new AppError("Temporada nao encontrada.", 404);
  }

  return season;
}

async function createSeasonRound(seasonId, data, user) {
  assertCanWriteSeason(user);
  return seasonsDao.createSeasonRound(seasonId, data);
}

async function createSeasonRoundLap(seasonRoundId, data, user) {
  assertCanWriteSeason(user);
  return seasonsDao.createSeasonRoundLap(seasonRoundId, data);
}

async function createSeasonRoundLaps(seasonRoundId, laps, user) {
  assertCanWriteSeason(user);
  return seasonsDao.createSeasonRoundLaps(seasonRoundId, laps);
}

async function listSeasonRoundLaps(seasonRoundId) {
  return seasonsDao.listSeasonRoundLaps(seasonRoundId);
}

module.exports = {
  createSeason,
  createSeasonRound,
  createSeasonRoundLap,
  createSeasonRoundLaps,
  getSeason,
  listSeasonRoundLaps,
  listSeasons
};
