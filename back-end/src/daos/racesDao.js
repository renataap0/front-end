const { execute, inClause, insertAndFind, rows, toMysqlDate, updateAndFind } = require("./helpers");
const { mapCar, mapDriver, mapRace, mapTeam, mapTrack } = require("./mappers");

const raceColumns = `
  r.id,
  r.nome AS name,
  r.status,
  r.voltas AS laps,
  r.melhor_volta_ms AS bestLapMs,
  r.ultima_volta_ms AS lastLapMs,
  r.data_corrida AS raceDate,
  r.equipe_id AS teamId,
  r.piloto_id AS driverId,
  r.pista_id AS trackId,
  r.carro_id AS carId,
  r.criado_em AS createdAt,
  r.atualizado_em AS updatedAt
`;

const racePlainColumns = `
  id,
  nome AS name,
  status,
  voltas AS laps,
  melhor_volta_ms AS bestLapMs,
  ultima_volta_ms AS lastLapMs,
  data_corrida AS raceDate,
  equipe_id AS teamId,
  piloto_id AS driverId,
  pista_id AS trackId,
  carro_id AS carId,
  criado_em AS createdAt,
  atualizado_em AS updatedAt
`;

const raceColumnMap = {
  name: "nome",
  status: "status",
  laps: "voltas",
  bestLapMs: "melhor_volta_ms",
  lastLapMs: "ultima_volta_ms",
  raceDate: "data_corrida",
  teamId: "equipe_id",
  driverId: "piloto_id",
  trackId: "pista_id",
  carId: "carro_id"
};

const teamJoinColumns = `
  t.id AS team_id,
  t.nome AS team_name,
  t.pais AS team_country,
  t.chefe AS team_principal,
  t.ano_fundacao AS team_foundedYear,
  t.criado_em AS team_createdAt,
  t.atualizado_em AS team_updatedAt
`;

const driverJoinColumns = `
  d.id AS driver_id,
  d.nome AS driver_name,
  d.nacionalidade AS driver_nationality,
  d.status AS driver_status,
  d.numero AS driver_number,
  d.equipe_id AS driver_teamId,
  d.criado_em AS driver_createdAt,
  d.atualizado_em AS driver_updatedAt
`;

const trackJoinColumns = `
  tr.id AS track_id,
  tr.nome AS track_name,
  tr.pais AS track_country,
  tr.cidade AS track_city,
  tr.tamanho_km AS track_lengthKm,
  tr.curvas AS track_turns,
  tr.setores AS track_sectors,
  tr.recorde_volta_ms AS track_recordLapMs,
  tr.aderencia AS track_grip,
  tr.elevacao AS track_elevation,
  tr.tipo AS track_type,
  tr.clima AS track_weather,
  tr.abrasao AS track_abrasion,
  tr.criado_em AS track_createdAt,
  tr.atualizado_em AS track_updatedAt
`;

const carJoinColumns = `
  c.id AS car_id,
  c.modelo AS car_model,
  c.codigo AS car_code,
  c.equipe_id AS car_teamId,
  c.piloto_id AS car_driverId,
  c.potencia AS car_power,
  c.aerodinamica AS car_aero,
  c.confiabilidade AS car_reliability,
  c.cuidado_pneus AS car_tireCare,
  c.ers AS car_ers,
  c.velocidade_maxima AS car_topSpeed,
  c.peso AS car_weight,
  c.pacote AS car_packageName,
  c.criado_em AS car_createdAt,
  c.atualizado_em AS car_updatedAt
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
    FROM corridas r
    INNER JOIN equipes t ON t.id = r.equipe_id
    INNER JOIN pilotos d ON d.id = r.piloto_id
    INNER JOIN pistas tr ON tr.id = r.pista_id
    INNER JOIN carros c ON c.id = r.carro_id
    ${where}
    ORDER BY ${orderBy}
  `;
}

async function listRaces(query = {}) {
  const where = [];
  const params = [];

  if (query.name) {
      where.push("r.nome LIKE ?");
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
  return listRacesByField("piloto_id", driverIds);
}

async function listRacesByCarIds(carIds) {
  return listRacesByField("carro_id", carIds);
}

async function listRacesByTrackIds(trackIds) {
  return listRacesByField("pista_id", trackIds);
}

async function findRaceById(id, connection = null) {
  const result = await rows(baseRaceJoin("WHERE r.id = ?"), [id], connection);
  return attachRelations(result[0]);
}

async function findRacePlainById(id, connection = null) {
  const result = await rows(`SELECT ${racePlainColumns} FROM corridas WHERE id = ?`, [id], connection);
  return mapRace(result[0]);
}

async function createRace(data) {
  return insertAndFind("corridas", normalizeRacePayload(data), raceColumnMap, findRaceById);
}

async function updateRace(id, data) {
  return updateAndFind("corridas", id, normalizeRacePayload(data), raceColumnMap, findRaceById);
}

async function deleteRace(id) {
  return execute("DELETE FROM corridas WHERE id = ?", [id]);
}

async function countRaces() {
  const result = await rows("SELECT COUNT(*) AS total FROM corridas");
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
