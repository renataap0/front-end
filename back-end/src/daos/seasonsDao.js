const { execute, inClause, insertAndFind, rows } = require("./helpers");
const { mapCar, mapDriver, mapSeason, mapSeasonRound, mapSeasonRoundLap, mapTrack } = require("./mappers");

const seasonColumns = `
  id,
  CONCAT('Temporada ', versao) AS name,
  2026 AS year,
  'Ativa' AS status,
  criado_em AS createdAt,
  NULL AS updatedAt
`;

const roundColumns = `
  sr.id,
  sr.temporada_id AS seasonId,
  NULL AS raceId,
  sr.pista_id AS trackId,
  tr.nome AS name,
  sr.ordem_indice AS roundNumber,
  NULL AS scheduledAt,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const lapColumns = `
  l.id,
  l.etapa_temporada_id AS seasonRoundId,
  l.piloto_id AS driverId,
  c.id AS carId,
  l.numero_volta AS lapNumber,
  l.tempo_volta_ms AS lapTimeMs,
  NULL AS createdAt
`;

function trackJoinColumns() {
  return `
    tr.id AS track_id,
    tr.nome AS track_name,
    tr.pais AS track_country,
    tr.cidade AS track_city,
    tr.tamanho_km AS track_lengthKm,
    tr.curvas AS track_turns,
    tr.setores AS track_sectors,
    tr.recorde_ms AS track_recordLapMs,
    tr.aderencia AS track_grip,
    tr.elevacao AS track_elevation,
    tr.tipo AS track_type,
    tr.clima AS track_weather,
    tr.abrasao AS track_abrasion,
    NULL AS track_createdAt,
    NULL AS track_updatedAt
  `;
}

function driverJoinColumns() {
  return `
    d.id AS driver_id,
    d.nome AS driver_name,
    NULL AS driver_nationality,
    d.status AS driver_status,
    NULL AS driver_number,
    d.equipe_id AS driver_teamId,
    NULL AS driver_createdAt,
    NULL AS driver_updatedAt
  `;
}

function carJoinColumns() {
  return `
    c.id AS car_id,
    c.modelo AS car_model,
    c.modelo AS car_code,
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
    NULL AS car_createdAt,
    NULL AS car_updatedAt
  `;
}

function attachRoundRelations(row) {
  const round = mapSeasonRound(row);

  if (!round) {
    return null;
  }

  round.race = null;
  round.track = mapTrack(row, "track_");
  return round;
}

function attachLapRelations(row) {
  const lap = mapSeasonRoundLap(row);

  if (!lap) {
    return null;
  }

  lap.driver = mapDriver(row, "driver_");
  lap.car = mapCar(row, "car_");
  return lap;
}

async function listRoundsBySeasonIds(seasonIds) {
  if (!seasonIds.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${roundColumns}, ${trackJoinColumns()}
      FROM etapas_temporada sr
      INNER JOIN pistas tr ON tr.id = sr.pista_id
      WHERE sr.temporada_id IN (${inClause(seasonIds)})
      ORDER BY sr.ordem_indice ASC
    `,
    seasonIds
  );

  return result.map((row) => attachRoundRelations(row));
}

async function listSeasons() {
  const seasons = (await rows(`SELECT ${seasonColumns} FROM temporadas ORDER BY versao DESC`)).map((row) => mapSeason(row));
  const rounds = await listRoundsBySeasonIds(seasons.map((season) => season.id));

  return seasons.map((season) => ({
    ...season,
    rounds: rounds.filter((round) => round.seasonId === season.id)
  }));
}

async function findSeasonById(id) {
  const result = await rows(`SELECT ${seasonColumns} FROM temporadas WHERE id = ?`, [id]);
  const season = mapSeason(result[0]);

  if (!season) {
    return null;
  }

  const rounds = await listRoundsBySeasonIds([id]);
  const laps = await listLapsByRoundIds(rounds.map((round) => round.id));

  season.rounds = rounds.map((round) => ({
    ...round,
    laps: laps.filter((lap) => lap.seasonRoundId === round.id)
  }));

  return season;
}

async function createSeason(data) {
  const result = await execute("INSERT INTO temporadas (versao) VALUES (?)", [data.year || new Date().getFullYear()]);
  return findSeasonById(result.insertId);
}

async function findSeasonRoundById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${roundColumns}, ${trackJoinColumns()}
      FROM etapas_temporada sr
      INNER JOIN pistas tr ON tr.id = sr.pista_id
      WHERE sr.id = ?
    `,
    [id],
    connection
  );

  return attachRoundRelations(result[0]);
}

async function createSeasonRound(seasonId, data) {
  const result = await execute(
    `
      INSERT INTO etapas_temporada (temporada_id, pista_id, ordem_indice, status)
      VALUES (?, ?, ?, ?)
    `,
    [seasonId, data.trackId, data.roundNumber, data.status || "pendente"]
  );

  return findSeasonRoundById(result.insertId);
}

async function createSeasonRoundLap(seasonRoundId, data) {
  const result = await execute(
    `
      INSERT INTO voltas_etapa (etapa_temporada_id, piloto_id, tempo_volta_ms, numero_volta)
      VALUES (?, ?, ?, ?)
    `,
    [seasonRoundId, data.driverId, data.lapTimeMs, data.lapNumber]
  );

  const laps = await listLapsByIds([result.insertId]);
  return laps[0] || null;
}

async function listLapsByIds(ids) {
  if (!ids.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${lapColumns}, ${driverJoinColumns()}, ${carJoinColumns()}
      FROM voltas_etapa l
      INNER JOIN pilotos d ON d.id = l.piloto_id
      LEFT JOIN carros c ON c.piloto_id = d.id
      WHERE l.id IN (${inClause(ids)})
      ORDER BY l.numero_volta ASC, l.id ASC
    `,
    ids
  );

  return result.map((row) => attachLapRelations(row));
}

async function listLapsByRoundIds(roundIds) {
  if (!roundIds.length) {
    return [];
  }

  const result = await rows(
    `
      SELECT ${lapColumns}, ${driverJoinColumns()}, ${carJoinColumns()}
      FROM voltas_etapa l
      INNER JOIN pilotos d ON d.id = l.piloto_id
      LEFT JOIN carros c ON c.piloto_id = d.id
      WHERE l.etapa_temporada_id IN (${inClause(roundIds)})
      ORDER BY l.numero_volta ASC, l.id ASC
    `,
    roundIds
  );

  return result.map((row) => attachLapRelations(row));
}

async function listSeasonRoundLaps(seasonRoundId) {
  return listLapsByRoundIds([seasonRoundId]);
}

async function countSeasonRoundLaps() {
  const result = await rows("SELECT COUNT(*) AS total FROM voltas_etapa");
  return result[0].total;
}

module.exports = {
  countSeasonRoundLaps,
  createSeason,
  createSeasonRound,
  createSeasonRoundLap,
  findSeasonById,
  listSeasonRoundLaps,
  listSeasons
};
