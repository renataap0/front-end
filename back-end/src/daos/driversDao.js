const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapDriver, mapTeam } = require("./mappers");

const driverColumns = `
  d.id,
  d.nome AS name,
  d.nacionalidade AS nationality,
  d.status,
  d.numero AS number,
  d.equipe_id AS teamId,
  d.criado_em AS createdAt,
  d.atualizado_em AS updatedAt
`;

const driverPlainColumns = `
  id,
  nome AS name,
  nacionalidade AS nationality,
  status,
  numero AS number,
  equipe_id AS teamId,
  criado_em AS createdAt,
  atualizado_em AS updatedAt
`;

const teamJoinColumns = `
  t.id AS team_id,
  t.nome AS team_name,
  t.pais AS team_country,
  t.chefe AS team_principal,
  t.ano_fundacao AS team_foundedYear,
  t.criado_em AS team_createdAt,
  t.atualizado_em AS team_updatedAt
`;

const driverColumnMap = {
  name: "nome",
  nationality: "nacionalidade",
  status: "status",
  number: "numero",
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
