const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapCar, mapDriver, mapTeam } = require("./mappers");

const carColumns = `
  c.id,
  c.modelo AS model,
  c.modelo AS code,
  c.equipe_id AS teamId,
  c.piloto_id AS driverId,
  c.potencia AS power,
  c.aerodinamica AS aero,
  c.confiabilidade AS reliability,
  c.cuidado_pneus AS tireCare,
  c.ers,
  c.velocidade_maxima AS topSpeed,
  c.peso AS weight,
  c.pacote AS packageName,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const carPlainColumns = `
  id,
  modelo AS model,
  modelo AS code,
  equipe_id AS teamId,
  piloto_id AS driverId,
  potencia AS power,
  aerodinamica AS aero,
  confiabilidade AS reliability,
  cuidado_pneus AS tireCare,
  ers,
  velocidade_maxima AS topSpeed,
  peso AS weight,
  pacote AS packageName,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const carColumnMap = {
  model: "modelo",
  teamId: "equipe_id",
  driverId: "piloto_id",
  power: "potencia",
  aero: "aerodinamica",
  reliability: "confiabilidade",
  tireCare: "cuidado_pneus",
  ers: "ers",
  topSpeed: "velocidade_maxima",
  weight: "peso",
  packageName: "pacote"
};

const teamJoinColumns = `
  t.id AS team_id,
  t.nome AS team_name,
  NULL AS team_country,
  NULL AS team_principal,
  NULL AS team_foundedYear,
  NULL AS team_createdAt,
  NULL AS team_updatedAt
`;

const driverJoinColumns = `
  d.id AS driver_id,
  d.nome AS driver_name,
  NULL AS driver_nationality,
  d.status AS driver_status,
  NULL AS driver_number,
  d.equipe_id AS driver_teamId,
  NULL AS driver_createdAt,
  NULL AS driver_updatedAt
`;

function attachRelations(row) {
  const car = mapCar(row);

  if (!car) {
    return null;
  }

  car.team = mapTeam(row, "team_");
  car.driver = mapDriver(row, "driver_");
  return car;
}

async function listCars(query = {}) {
  const where = [];
  const params = [];

  if (query.model) {
    where.push("c.modelo LIKE ?");
    params.push(`%${query.model}%`);
  }

  if (query.teamId) {
    where.push("c.equipe_id = ?");
    params.push(Number(query.teamId));
  }

  if (query.driverId) {
    where.push("c.piloto_id = ?");
    params.push(Number(query.driverId));
  }

  const result = await rows(
    `
      SELECT ${carColumns}, ${teamJoinColumns}, ${driverJoinColumns}
      FROM carros c
      INNER JOIN equipes t ON t.id = c.equipe_id
      INNER JOIN pilotos d ON d.id = c.piloto_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.modelo ASC
    `,
    params
  );

  return result.map((row) => attachRelations(row));
}

async function listCarsByDriverIds(driverIds) {
  if (!driverIds.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${carColumns}
      FROM carros c
      WHERE c.piloto_id IN (${inClause(driverIds)})
      ORDER BY c.modelo ASC
    `,
    driverIds
  );

  return result.map((row) => mapCar(row));
}

async function listCarsByTeamIds(teamIds) {
  if (!teamIds.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${carColumns}
      FROM carros c
      WHERE c.equipe_id IN (${inClause(teamIds)})
      ORDER BY c.modelo ASC
    `,
    teamIds
  );

  return result.map((row) => mapCar(row));
}

async function findCarById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${carColumns}, ${teamJoinColumns}, ${driverJoinColumns}
      FROM carros c
      INNER JOIN equipes t ON t.id = c.equipe_id
      INNER JOIN pilotos d ON d.id = c.piloto_id
      WHERE c.id = ?
    `,
    [id],
    connection
  );

  return attachRelations(result[0]);
}

async function findCarPlainById(id, connection = null) {
  const result = await rows(`SELECT ${carPlainColumns} FROM carros WHERE id = ?`, [id], connection);
  return mapCar(result[0]);
}

async function createCar(data) {
  return insertAndFind("carros", data, carColumnMap, findCarById);
}

async function updateCar(id, data) {
  return updateAndFind("carros", id, data, carColumnMap, findCarById);
}

async function deleteCar(id) {
  return execute("DELETE FROM carros WHERE id = ?", [id]);
}

async function countCars() {
  const result = await rows("SELECT COUNT(*) AS total FROM carros");
  return result[0].total;
}

module.exports = {
  countCars,
  createCar,
  deleteCar,
  findCarById,
  findCarPlainById,
  listCars,
  listCarsByDriverIds,
  listCarsByTeamIds,
  updateCar
};
