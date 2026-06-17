const { execute, inClause, insertAndFind, rows, toMysqlDate, updateAndFind } = require("./helpers");
const { mapCar, mapDriver, mapRace, mapTeam, mapTrack } = require("./mappers");

const raceColumns = `
  r.id,
  r.name,
  r.status,
  r.laps,
  r.best_lap_ms AS bestLapMs,
  r.last_lap_ms AS lastLapMs,
  r.race_date AS raceDate,
  r.team_id AS teamId,
  r.driver_id AS driverId,
  r.track_id AS trackId,
  r.car_id AS carId,
  r.created_at AS createdAt,
  r.updated_at AS updatedAt
`;

const racePlainColumns = `
  id,
  name,
  status,
  laps,
  best_lap_ms AS bestLapMs,
  last_lap_ms AS lastLapMs,
  race_date AS raceDate,
  team_id AS teamId,
  driver_id AS driverId,
  track_id AS trackId,
  car_id AS carId,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const raceColumnMap = {
  name: "name",
  status: "status",
  laps: "laps",
  bestLapMs: "best_lap_ms",
  lastLapMs: "last_lap_ms",
  raceDate: "race_date",
  teamId: "team_id",
  driverId: "driver_id",
  trackId: "track_id",
  carId: "car_id"
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

const trackJoinColumns = `
  tr.id AS track_id,
  tr.name AS track_name,
  tr.country AS track_country,
  tr.city AS track_city,
  tr.length_km AS track_lengthKm,
  tr.turns AS track_turns,
  tr.sectors AS track_sectors,
  tr.record_lap_ms AS track_recordLapMs,
  tr.grip AS track_grip,
  tr.elevation AS track_elevation,
  tr.type AS track_type,
  tr.weather AS track_weather,
  tr.abrasion AS track_abrasion,
  tr.created_at AS track_createdAt,
  tr.updated_at AS track_updatedAt
`;

const carJoinColumns = `
  c.id AS car_id,
  c.model AS car_model,
  c.code AS car_code,
  c.team_id AS car_teamId,
  c.driver_id AS car_driverId,
  c.power AS car_power,
  c.aero AS car_aero,
  c.reliability AS car_reliability,
  c.tire_care AS car_tireCare,
  c.ers AS car_ers,
  c.top_speed AS car_topSpeed,
  c.weight AS car_weight,
  c.package_name AS car_packageName,
  c.created_at AS car_createdAt,
  c.updated_at AS car_updatedAt
`;

function normalizeRacePayload(data) {
  return {
    ...data,
    raceDate: toMysqlDate(data.raceDate)
  };
}

function attachRelations(row) {
  const race = mapRace(row);

  if (!race) {
    return null;
  }

  race.team = mapTeam(row, "team_");
  race.driver = mapDriver(row, "driver_");
  race.track = mapTrack(row, "track_");
  race.car = mapCar(row, "car_");
  return race;
}

function baseRaceJoin(where = "", orderBy = "r.id ASC") {
  return `
    SELECT ${raceColumns}, ${teamJoinColumns}, ${driverJoinColumns}, ${trackJoinColumns}, ${carJoinColumns}
    FROM races r
    INNER JOIN teams t ON t.id = r.team_id
    INNER JOIN drivers d ON d.id = r.driver_id
    INNER JOIN tracks tr ON tr.id = r.track_id
    INNER JOIN cars c ON c.id = r.car_id
    ${where}
    ORDER BY ${orderBy}
  `;
}

async function listRaces(query = {}) {
  const where = [];
  const params = [];

  if (query.name) {
    where.push("r.name LIKE ?");
    params.push(`%${query.name}%`);
  }

  if (query.status) {
    where.push("r.status = ?");
    params.push(query.status);
  }

  ["teamId", "driverId", "trackId", "carId"].forEach((field) => {
    if (query[field]) {
      where.push(`r.${raceColumnMap[field]} = ?`);
      params.push(Number(query[field]));
    }
  });

  const sql = baseRaceJoin(where.length ? `WHERE ${where.join(" AND ")}` : "");
  return (await rows(sql, params)).map((row) => attachRelations(row));
}

async function listRacesByField(field, values) {
  if (!values.length) {
    return [];
  }

  const sql = baseRaceJoin(`WHERE r.${field} IN (${inClause(values)})`);
  return (await rows(sql, values)).map((row) => attachRelations(row));
}

async function listRacesByDriverIds(driverIds) {
  return listRacesByField("driver_id", driverIds);
}

async function listRacesByCarIds(carIds) {
  return listRacesByField("car_id", carIds);
}

async function listRacesByTrackIds(trackIds) {
  return listRacesByField("track_id", trackIds);
}

async function findRaceById(id, connection = null) {
  const result = await rows(baseRaceJoin("WHERE r.id = ?"), [id], connection);
  return attachRelations(result[0]);
}

async function findRacePlainById(id, connection = null) {
  const result = await rows(`SELECT ${racePlainColumns} FROM races WHERE id = ?`, [id], connection);
  return mapRace(result[0]);
}

async function createRace(data) {
  return insertAndFind("races", normalizeRacePayload(data), raceColumnMap, findRaceById);
}

async function updateRace(id, data) {
  return updateAndFind("races", id, normalizeRacePayload(data), raceColumnMap, findRaceById);
}

async function deleteRace(id) {
  return execute("DELETE FROM races WHERE id = ?", [id]);
}

async function countRaces() {
  const result = await rows("SELECT COUNT(*) AS total FROM races");
  return result[0].total;
}

module.exports = {
  countRaces,
  createRace,
  deleteRace,
  findRaceById,
  findRacePlainById,
  listRaces,
  listRacesByCarIds,
  listRacesByDriverIds,
  listRacesByTrackIds,
  updateRace
};
