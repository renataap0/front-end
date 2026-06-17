const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapDriver, mapTeam } = require("./mappers");

const driverColumns = `
  d.id,
  d.nome AS name,
  NULL AS nationality,
  d.status,
  NULL AS number,
  d.equipe_id AS teamId,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const driverPlainColumns = `
  id,
  nome AS name,
  NULL AS nationality,
  status,
  NULL AS number,
  equipe_id AS teamId,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const teamJoinColumns = `
  t.id AS team_id,
  t.nome AS team_name,
  NULL AS team_country,
  NULL AS team_principal,
  NULL AS team_foundedYear,
  NULL AS team_createdAt,
  NULL AS team_updatedAt
`;

const driverColumnMap = {
  name: "nome",
  status: "status",
  teamId: "equipe_id"
};

function normalizeDriverPayload(data) {
  const statusMap = {
    Titular: "titular",
    Reserva: "reserva",
    "Em avaliacao": "em avaliacao"
  };

  return {
    ...data,
    status: statusMap[data.status] || data.status
  };
}

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
    where.push("d.nome LIKE ?");
    params.push(`%${query.name}%`);
  }

  if (query.status) {
    where.push("d.status = ?");
    params.push(normalizeDriverPayload({ status: query.status }).status);
  }

  if (query.teamId) {
    where.push("d.equipe_id = ?");
    params.push(Number(query.teamId));
  }

  const sql = `
    SELECT ${driverColumns}, ${teamJoinColumns}
    FROM pilotos d
    INNER JOIN equipes t ON t.id = d.equipe_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY d.nome ASC
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
      FROM pilotos d
      WHERE d.equipe_id IN (${inClause(teamIds)})
      ORDER BY d.nome ASC
    `,
    teamIds
  );

  return result.map((row) => mapDriver(row));
}

async function findDriverById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${driverColumns}, ${teamJoinColumns}
      FROM pilotos d
      INNER JOIN equipes t ON t.id = d.equipe_id
      WHERE d.id = ?
    `,
    [id],
    connection
  );

  return attachTeam(result[0]);
}

async function findDriverPlainById(id, connection = null) {
  const result = await rows(`SELECT ${driverPlainColumns} FROM pilotos WHERE id = ?`, [id], connection);
  return mapDriver(result[0]);
}

async function createDriver(data) {
  return insertAndFind("pilotos", normalizeDriverPayload(data), driverColumnMap, findDriverById);
}

async function updateDriver(id, data) {
  return updateAndFind("pilotos", id, normalizeDriverPayload(data), driverColumnMap, findDriverById);
}

async function deleteDriver(id) {
  return execute("DELETE FROM pilotos WHERE id = ?", [id]);
}

async function countDrivers() {
  const result = await rows("SELECT COUNT(*) AS total FROM pilotos");
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
