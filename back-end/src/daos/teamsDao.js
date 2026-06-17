const { execute, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapTeam } = require("./mappers");

const teamColumns = `
  id,
  nome AS name,
  NULL AS country,
  NULL AS principal,
  NULL AS foundedYear,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const teamColumnMap = {
  name: "nome"
};

async function listTeams(query = {}) {
  const where = [];
  const params = [];

  if (query.name) {
    where.push("name LIKE ?");
    params.push(`%${query.name}%`);
  }

  if (query.country) {
    where.push("country LIKE ?");
    params.push(`%${query.country}%`);
  }

  const sql = `
    SELECT ${teamColumns}
    FROM equipes
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY name ASC
  `;

  return (await rows(sql, params)).map((row) => mapTeam(row));
}

async function findTeamById(id, connection = null) {
  const result = await rows(`SELECT ${teamColumns} FROM equipes WHERE id = ?`, [id], connection);
  return mapTeam(result[0]);
}

async function createTeam(data) {
  return insertAndFind("equipes", data, teamColumnMap, findTeamById);
}

async function updateTeam(id, data) {
  return updateAndFind("equipes", id, data, teamColumnMap, findTeamById);
}

async function deleteTeam(id) {
  return execute("DELETE FROM equipes WHERE id = ?", [id]);
}

async function countTeams() {
  const result = await rows("SELECT COUNT(*) AS total FROM equipes");
  return result[0].total;
}

async function countUsersByTeam(id) {
  const result = await rows("SELECT COUNT(*) AS total FROM pilotos WHERE equipe_id = ?", [id]);
  return result[0].total;
}

module.exports = {
  countTeams,
  countUsersByTeam,
  createTeam,
  deleteTeam,
  findTeamById,
  listTeams,
  teamColumns,
  updateTeam
};
