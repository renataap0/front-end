const { execute, inClause, insertAndFind, rows, updateAndFind } = require("./helpers");
const { mapTrack } = require("./mappers");

const trackColumns = `
  id,
  nome AS name,
  pais AS country,
  cidade AS city,
  tamanho_km AS lengthKm,
  curvas AS turns,
  setores AS sectors,
  recorde_volta_ms AS recordLapMs,
  aderencia AS grip,
  elevacao AS elevation,
  tipo AS type,
  clima AS weather,
  abrasao AS abrasion,
  criado_em AS createdAt,
  atualizado_em AS updatedAt
`;

const trackColumnMap = {
  name: "nome",
  country: "pais",
  city: "cidade",
  lengthKm: "tamanho_km",
  type: "tipo",
  turns: "curvas",
  sectors: "setores",
  recordLapMs: "recorde_volta_ms",
  grip: "aderencia",
  elevation: "elevacao",
  weather: "clima",
  abrasion: "abrasao"
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
