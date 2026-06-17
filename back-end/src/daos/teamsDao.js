const { execute, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapTeam } = require("./mappers");

const teamColumns = `
  id,
  name,
  country,
  principal,
  founded_year AS foundedYear,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const teamColumnMap = {
  name: "name",
  country: "country",
  principal: "principal",
  foundedYear: "founded_year"
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
    FROM teams
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY name ASC
  `;

  return (await rows(sql, params)).map((row) => mapTeam(row));
}

async function findTeamById(id, connection = null) {
  const result = await rows(`SELECT ${teamColumns} FROM teams WHERE id = ?`, [id], connection);
  return mapTeam(result[0]);
}

async function createTeam(data) {
  return insertAndFind("teams", data, teamColumnMap, findTeamById);
}

async function updateTeam(id, data) {
  return updateAndFind("teams", id, data, teamColumnMap, findTeamById);
}

async function deleteTeam(id) {
  return execute("DELETE FROM teams WHERE id = ?", [id]);
}

async function countTeams() {
  const result = await rows("SELECT COUNT(*) AS total FROM teams");
  return result[0].total;
}

async function countUsersByTeam(id) {
  const result = await rows("SELECT COUNT(*) AS total FROM users WHERE team_id = ?", [id]);
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
