const carsDao = require("../daos/carsDao");
const driversDao = require("../daos/driversDao");
const teamsDao = require("../daos/teamsDao");
const { AppError } = require("../utils/AppError");

async function attachTeamCollections(teams) {
  const teamIds = teams.map((team) => team.id);
  const [drivers, cars] = await Promise.all([
    driversDao.listDriversByTeamIds(teamIds),
    carsDao.listCarsByTeamIds(teamIds)
  ]);

  return teams.map((team) => ({
    ...team,
    drivers: drivers.filter((driver) => driver.teamId === team.id),
    cars: cars.filter((car) => car.teamId === team.id)
  }));
}

async function listTeams(query) {
  const teams = await teamsDao.listTeams(query);
  return attachTeamCollections(teams);
}

async function createTeam(data) {
  return teamsDao.createTeam(data);
}

async function updateTeam(id, data) {
  const team = await teamsDao.updateTeam(id, data);

  if (!team) {
    throw new AppError("Equipe nao encontrada.", 404);
  }

  return team;
}

async function deleteTeam(id) {
  const users = await teamsDao.countUsersByTeam(id);

  if (users > 0) {
    throw new AppError("Nao e possivel excluir equipe vinculada a usuarios.", 409);
  }

  return teamsDao.deleteTeam(id);
}

module.exports = { createTeam, deleteTeam, listTeams, updateTeam };
