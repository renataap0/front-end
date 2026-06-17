const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapTrack } = require("./mappers");

const trackColumns = `
  id,
  name,
  country,
  city,
  length_km AS lengthKm,
  turns,
  sectors,
  record_lap_ms AS recordLapMs,
  grip,
  elevation,
  type,
  weather,
  abrasion,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const trackColumnMap = {
  name: "name",
  country: "country",
  city: "city",
  lengthKm: "length_km",
  turns: "turns",
  sectors: "sectors",
  recordLapMs: "record_lap_ms",
  grip: "grip",
  elevation: "elevation",
  type: "type",
  weather: "weather",
  abrasion: "abrasion"
};

async function listTracks(query = {}) {
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

  if (query.type) {
    where.push("type = ?");
    params.push(query.type);
  }

  const result = await rows(
    `
      SELECT ${trackColumns}
      FROM tracks
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY name ASC
    `,
    params
  );

  return result.map((row) => mapTrack(row));
}

async function listTracksByIds(ids) {
  if (!ids.length) {
    return [];
  }

  const result = await rows(`SELECT ${trackColumns} FROM tracks WHERE id IN (${inClause(ids)})`, ids);
  return result.map((row) => mapTrack(row));
}

async function findTrackById(id, connection = null) {
  const result = await rows(`SELECT ${trackColumns} FROM tracks WHERE id = ?`, [id], connection);
  return mapTrack(result[0]);
}

async function createTrack(data) {
  return insertAndFind("tracks", data, trackColumnMap, findTrackById);
}

async function updateTrack(id, data) {
  return updateAndFind("tracks", id, data, trackColumnMap, findTrackById);
}

async function deleteTrack(id) {
  return execute("DELETE FROM tracks WHERE id = ?", [id]);
}

async function countTracks() {
  const result = await rows("SELECT COUNT(*) AS total FROM tracks");
  return result[0].total;
}

module.exports = {
  countTracks,
  createTrack,
  deleteTrack,
  findTrackById,
  listTracks,
  listTracksByIds,
  updateTrack
};
