const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapTrack } = require("./mappers");

const trackColumns = `
  id,
  nome AS name,
  pais AS country,
  cidade AS city,
  tamanho_km AS lengthKm,
  0 AS turns,
  3 AS sectors,
  90000 AS recordLapMs,
  80 AS grip,
  0 AS elevation,
  tipo AS type,
  'Variavel' AS weather,
  50 AS abrasion,
  NULL AS createdAt,
  NULL AS updatedAt
`;

const trackColumnMap = {
  name: "nome",
  country: "pais",
  city: "cidade",
  lengthKm: "tamanho_km",
  type: "tipo"
};

async function listTracks(query = {}) {
  const where = [];
  const params = [];

  if (query.name) {
    where.push("nome LIKE ?");
    params.push(`%${query.name}%`);
  }

  if (query.country) {
    where.push("pais LIKE ?");
    params.push(`%${query.country}%`);
  }

  if (query.type) {
    where.push("tipo = ?");
    params.push(query.type);
  }

  const result = await rows(
    `
      SELECT ${trackColumns}
      FROM pistas
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY nome ASC
    `,
    params
  );

  return result.map((row) => mapTrack(row));
}

async function listTracksByIds(ids) {
  if (!ids.length) {
    return [];
  }

  const result = await rows(`SELECT ${trackColumns} FROM pistas WHERE id IN (${inClause(ids)})`, ids);
  return result.map((row) => mapTrack(row));
}

async function findTrackById(id, connection = null) {
  const result = await rows(`SELECT ${trackColumns} FROM pistas WHERE id = ?`, [id], connection);
  return mapTrack(result[0]);
}

async function createTrack(data) {
  return insertAndFind("pistas", data, trackColumnMap, findTrackById);
}

async function updateTrack(id, data) {
  return updateAndFind("pistas", id, data, trackColumnMap, findTrackById);
}

async function deleteTrack(id) {
  return execute("DELETE FROM pistas WHERE id = ?", [id]);
}

async function countTracks() {
  const result = await rows("SELECT COUNT(*) AS total FROM pistas");
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
