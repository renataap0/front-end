const racesDao = require("../daos/racesDao");
const tracksDao = require("../daos/tracksDao");
const { AppError } = require("../utils/AppError");

async function listTracks(query) {
  return tracksDao.listTracks(query);
}

async function getTrack(id) {
  const track = await tracksDao.findTrackById(id);

  if (!track) {
    throw new AppError("Pista nao encontrada.", 404);
  }

  track.races = await racesDao.listRacesByTrackIds([id]);
  return track;
}

function assertCanManageTrack(user) {
  if (!["admin", "team"].includes(user.role)) {
    throw new AppError("Usuario sem permissao para gerenciar pistas.", 403);
  }
}

async function createTrack(data, user) {
  assertCanManageTrack(user);
  return tracksDao.createTrack(data);
}

async function updateTrack(id, data, user) {
  assertCanManageTrack(user);
  const track = await tracksDao.updateTrack(id, data);

  if (!track) {
    throw new AppError("Pista nao encontrada.", 404);
  }

  return track;
}

async function deleteTrack(id, user) {
  assertCanManageTrack(user);
  return tracksDao.deleteTrack(id);
}

module.exports = { createTrack, deleteTrack, getTrack, listTracks, updateTrack };
