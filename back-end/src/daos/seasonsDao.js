const { execute, inClause, insertAndFind, rows, toMysqlDate } = require("./helpers");
const { mapCar, mapDriver, mapRace, mapSeason, mapSeasonRound, mapSeasonRoundLap, mapTrack } = require("./mappers");

const seasonColumns = `
  id,
  name,
  year,
  status,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const seasonColumnMap = {
  name: "name",
  year: "year",
  status: "status"
};

const roundColumns = `
  sr.id,
  sr.season_id AS seasonId,
  sr.race_id AS raceId,
  sr.track_id AS trackId,
  sr.name,
  sr.round_number AS roundNumber,
  sr.scheduled_at AS scheduledAt,
  sr.created_at AS createdAt,
  sr.updated_at AS updatedAt
`;

const roundColumnMap = {
  seasonId: "season_id",
  raceId: "race_id",
  trackId: "track_id",
  name: "name",
  roundNumber: "round_number",
  scheduledAt: "scheduled_at"
};

const lapColumns = `
  l.id,
  l.season_round_id AS seasonRoundId,
  l.driver_id AS driverId,
  l.car_id AS carId,
  l.lap_number AS lapNumber,
  l.lap_time_ms AS lapTimeMs,
  l.created_at AS createdAt
`;

function raceJoinColumns() {
  return `
    r.id AS race_id,
    r.name AS race_name,
    r.status AS race_status,
    r.laps AS race_laps,
    r.best_lap_ms AS race_bestLapMs,
    r.last_lap_ms AS race_lastLapMs,
    r.race_date AS race_raceDate,
    r.team_id AS race_teamId,
    r.driver_id AS race_driverId,
    r.track_id AS race_trackId,
    r.car_id AS race_carId,
    r.created_at AS race_createdAt,
    r.updated_at AS race_updatedAt
  `;
}

function trackJoinColumns() {
  return `
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
}

function driverJoinColumns() {
  return `
    d.id AS driver_id,
    d.name AS driver_name,
    d.nationality AS driver_nationality,
    d.status AS driver_status,
    d.number AS driver_number,
    d.team_id AS driver_teamId,
    d.created_at AS driver_createdAt,
    d.updated_at AS driver_updatedAt
  `;
}

function carJoinColumns() {
  return `
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
}

function normalizeRoundPayload(data) {
  return {
    ...data,
    scheduledAt: toMysqlDate(data.scheduledAt)
  };
}

function attachRoundRelations(row) {
  const round = mapSeasonRound(row);

  if (!round) {
    return null;
  }

  round.race = mapRace(row, "race_");
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
      SELECT ${roundColumns}, ${raceJoinColumns()}, ${trackJoinColumns()}
      FROM season_rounds sr
      LEFT JOIN races r ON r.id = sr.race_id
      INNER JOIN tracks tr ON tr.id = sr.track_id
      WHERE sr.season_id IN (${inClause(seasonIds)})
      ORDER BY sr.round_number ASC
    `,
    seasonIds
  );

  return result.map((row) => attachRoundRelations(row));
}

async function listSeasons() {
  const seasons = (await rows(`SELECT ${seasonColumns} FROM seasons ORDER BY year DESC, name ASC`)).map((row) => mapSeason(row));
  const rounds = await listRoundsBySeasonIds(seasons.map((season) => season.id));

  return seasons.map((season) => ({
    ...season,
    rounds: rounds.filter((round) => round.seasonId === season.id)
  }));
}

async function findSeasonById(id) {
  const result = await rows(`SELECT ${seasonColumns} FROM seasons WHERE id = ?`, [id]);
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
  return insertAndFind("seasons", data, seasonColumnMap, findSeasonById);
}

async function findSeasonRoundById(id, connection = null) {
  const result = await rows(
    `
      SELECT ${roundColumns}, ${raceJoinColumns()}, ${trackJoinColumns()}
      FROM season_rounds sr
      LEFT JOIN races r ON r.id = sr.race_id
      INNER JOIN tracks tr ON tr.id = sr.track_id
      WHERE sr.id = ?
    `,
    [id],
    connection
  );

  return attachRoundRelations(result[0]);
}

async function createSeasonRound(seasonId, data) {
  const payload = normalizeRoundPayload({ ...data, seasonId });
  const statementColumns = Object.fromEntries(Object.entries(roundColumnMap));
  return insertAndFind("season_rounds", payload, statementColumns, findSeasonRoundById);
}

async function createSeasonRoundLap(seasonRoundId, data) {
  const result = await execute(
    `
      INSERT INTO season_round_laps (season_round_id, driver_id, car_id, lap_number, lap_time_ms)
      VALUES (?, ?, ?, ?, ?)
    `,
    [seasonRoundId, data.driverId, data.carId ?? null, data.lapNumber, data.lapTimeMs]
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
      FROM season_round_laps l
      INNER JOIN drivers d ON d.id = l.driver_id
      LEFT JOIN cars c ON c.id = l.car_id
      WHERE l.id IN (${inClause(ids)})
      ORDER BY l.lap_number ASC, l.id ASC
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
      FROM season_round_laps l
      INNER JOIN drivers d ON d.id = l.driver_id
      LEFT JOIN cars c ON c.id = l.car_id
      WHERE l.season_round_id IN (${inClause(roundIds)})
      ORDER BY l.lap_number ASC, l.id ASC
    `,
    roundIds
  );

  return result.map((row) => attachLapRelations(row));
}

async function listSeasonRoundLaps(seasonRoundId) {
  return listLapsByRoundIds([seasonRoundId]);
}

async function countSeasonRoundLaps() {
  const result = await rows("SELECT COUNT(*) AS total FROM season_round_laps");
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
