const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapCar, mapDriver, mapTeam } = require("./mappers");

const carColumns = `
  c.id,
  c.model,
  c.code,
  c.team_id AS teamId,
  c.driver_id AS driverId,
  c.power,
  c.aero,
  c.reliability,
  c.tire_care AS tireCare,
  c.ers,
  c.top_speed AS topSpeed,
  c.weight,
  c.package_name AS packageName,
  c.created_at AS createdAt,
  c.updated_at AS updatedAt
`;

const carPlainColumns = `
  id,
  model,
  code,
  team_id AS teamId,
  driver_id AS driverId,
  power,
  aero,
  reliability,
  tire_care AS tireCare,
  ers,
  top_speed AS topSpeed,
  weight,
  package_name AS packageName,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const carColumnMap = {
  model: "model",
  code: "code",
  teamId: "team_id",
  driverId: "driver_id",
  power: "power",
  aero: "aero",
  reliability: "reliability",
  tireCare: "tire_care",
  ers: "ers",
  topSpeed: "top_speed",
  weight: "weight",
  packageName: "package_name"
};

const teamJoinColumns = `
  t.id AS team_id,
  t.name AS team_name,
  t.country AS team_country,
  t.principal AS team_principal,
  t.founded_year AS team_foundedYear,
  t.created_at AS team_createdAt,
  t.updated_at AS team_updatedAt
`;

const driverJoinColumns = `
  d.id AS driver_id,
  d.name AS driver_name,
  d.nationality AS driver_nationality,
  d.status AS driver_status,
  d.number AS driver_number,
  d.team_id AS driver_teamId,
  d.created_at AS driver_createdAt,
  d.updated_at AS driver_updatedAt
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
    where.push("c.model LIKE ?");
    params.push(`%${query.model}%`);
  }

  if (query.teamId) {
    where.push("c.team_id = ?");
    params.push(Number(query.teamId));
  }

  if (query.driverId) {
    where.push("c.driver_id = ?");
    params.push(Number(query.driverId));
  }

  const result = await rows(
    `
      SELECT ${carColumns}, ${teamJoinColumns}, ${driverJoinColumns}
      FROM cars c
      INNER JOIN teams t ON t.id = c.team_id
      LEFT JOIN drivers d ON d.id = c.driver_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.model ASC
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
      FROM cars c
      WHERE c.driver_id IN (${inClause(driverIds)})
      ORDER BY c.model ASC
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
      FROM cars c
      WHERE c.team_id IN (${inClause(teamIds)})
      ORDER BY c.model ASC
    `,
    teamIds
  );

  return result.map((row) => mapCar(row));
}

async function findCarById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${carColumns}, ${teamJoinColumns}, ${driverJoinColumns}
      FROM cars c
      INNER JOIN teams t ON t.id = c.team_id
      LEFT JOIN drivers d ON d.id = c.driver_id
      WHERE c.id = ?
    `,
    [id],
    connection
  );

  return attachRelations(result[0]);
}

async function findCarPlainById(id, connection = null) {
  const result = await rows(`SELECT ${carPlainColumns} FROM cars WHERE id = ?`, [id], connection);
  return mapCar(result[0]);
}

async function createCar(data) {
  return insertAndFind("cars", data, carColumnMap, findCarById);
}

async function updateCar(id, data) {
  return updateAndFind("cars", id, data, carColumnMap, findCarById);
}

async function deleteCar(id) {
  return execute("DELETE FROM cars WHERE id = ?", [id]);
}

async function countCars() {
  const result = await rows("SELECT COUNT(*) AS total FROM cars");
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
