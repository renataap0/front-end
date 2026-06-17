const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapDriver, mapTeam } = require("./mappers");

const driverColumns = `
  d.id,
  d.name,
  d.nationality,
  d.status,
  d.number,
  d.team_id AS teamId,
  d.created_at AS createdAt,
  d.updated_at AS updatedAt
`;

const driverPlainColumns = `
  id,
  name,
  nationality,
  status,
  number,
  team_id AS teamId,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const teamJoinColumns = `
  t.id AS team_id,
  t.name AS team_name,
  t.country AS team_country,
  t.principal AS team_principal,
  t.founded_year AS team_foundedYear,
  t.created_at AS team_createdAt,
  t.updated_at AS team_updatedAt
`;

const driverColumnMap = {
  name: "name",
  nationality: "nationality",
  status: "status",
  number: "number",
  teamId: "team_id"
};

function attachTeam(row) {
  const driver = mapDriver(row);

  if (!driver) {
    return null;
  }

  driver.team = mapTeam(row, "team_");
  return driver;
}

async function listDrivers(query = {}) {
  const where = [];
  const params = [];

  if (query.name) {
    where.push("d.name LIKE ?");
    params.push(`%${query.name}%`);
  }

  if (query.status) {
    where.push("d.status = ?");
    params.push(query.status);
  }

  if (query.teamId) {
    where.push("d.team_id = ?");
    params.push(Number(query.teamId));
  }

  const sql = `
    SELECT ${driverColumns}, ${teamJoinColumns}
    FROM drivers d
    INNER JOIN teams t ON t.id = d.team_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY d.name ASC
  `;

  return (await rows(sql, params)).map((row) => attachTeam(row));
}

async function listDriversByTeamIds(teamIds) {
  if (!teamIds.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${driverColumns}
      FROM drivers d
      WHERE d.team_id IN (${inClause(teamIds)})
      ORDER BY d.name ASC
    `,
    teamIds
  );

  return result.map((row) => mapDriver(row));
}

async function findDriverById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${driverColumns}, ${teamJoinColumns}
      FROM drivers d
      INNER JOIN teams t ON t.id = d.team_id
      WHERE d.id = ?
    `,
    [id],
    connection
  );

  return attachTeam(result[0]);
}

async function findDriverPlainById(id, connection = null) {
  const result = await rows(`SELECT ${driverPlainColumns} FROM drivers WHERE id = ?`, [id], connection);
  return mapDriver(result[0]);
}

async function createDriver(data) {
  return insertAndFind("drivers", data, driverColumnMap, findDriverById);
}

async function updateDriver(id, data) {
  return updateAndFind("drivers", id, data, driverColumnMap, findDriverById);
}

async function deleteDriver(id) {
  return execute("DELETE FROM drivers WHERE id = ?", [id]);
}

async function countDrivers() {
  const result = await rows("SELECT COUNT(*) AS total FROM drivers");
  return result[0].total;
}

module.exports = {
  countDrivers,
  createDriver,
  deleteDriver,
  findDriverById,
  findDriverPlainById,
  listDrivers,
  listDriversByTeamIds,
  updateDriver
};
