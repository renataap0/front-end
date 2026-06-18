const { rows } = require("./helpers");
const { mapDriver, mapTeam, mapUser } = require("./mappers");

const userColumns = `
  u.id,
  u.nome_usuario AS username,
  u.senha_hash AS password,
  u.perfil AS role,
  p.equipe_id AS teamId,
  p.id AS driverId,
  u.criado_em AS createdAt,
  u.atualizado_em AS updatedAt
`;

const userPublicColumns = `
  u.id,
  u.nome_usuario AS username,
  u.perfil AS role,
  p.equipe_id AS teamId,
  p.id AS driverId,
  u.criado_em AS createdAt,
  u.atualizado_em AS updatedAt
`;

const joinedUserColumns = `
  t.id AS team_id,
  t.nome AS team_name,
  t.pais AS team_country,
  t.chefe AS team_principal,
  t.ano_fundacao AS team_foundedYear,
  t.criado_em AS team_createdAt,
  t.atualizado_em AS team_updatedAt,
  d.id AS driver_id,
  d.nome AS driver_name,
  d.nacionalidade AS driver_nationality,
  d.status AS driver_status,
  d.numero AS driver_number,
  d.equipe_id AS driver_teamId,
  d.criado_em AS driver_createdAt,
  d.atualizado_em AS driver_updatedAt
`;

function attachUserRelations(row, includePassword = false) {
  const user = mapUser(row);

  if (!user) {
    return null;
  }

  if (includePassword) {
    user.password = row.password;
  }

  user.team = mapTeam(row, "team_");
  user.driver = mapDriver(row, "driver_");

  if (user.role === "team" && !user.teamId) {
    user.teamId = 1;
    user.team = user.team || { id: 1, name: "Racing Angels" };
  }

  return user;
}

async function findUserByUsername(username) {
  const result = await rows(
    `
      SELECT ${userColumns}, ${joinedUserColumns}
      FROM usuarios u
      LEFT JOIN pilotos p ON p.usuario_id = u.id
      LEFT JOIN equipes t ON t.id = p.equipe_id OR (u.perfil = 'equipe' AND t.id = 1)
      LEFT JOIN pilotos d ON d.id = p.id
      WHERE u.nome_usuario = ?
    `,
    [username]
  );

  return attachUserRelations(result[0], true);
}

async function findUserById(id) {
  const result = await rows(
    `
      SELECT ${userPublicColumns}, ${joinedUserColumns}
      FROM usuarios u
      LEFT JOIN pilotos p ON p.usuario_id = u.id
      LEFT JOIN equipes t ON t.id = p.equipe_id OR (u.perfil = 'equipe' AND t.id = 1)
      LEFT JOIN pilotos d ON d.id = p.id
      WHERE u.id = ?
    `,
    [id]
  );

  return attachUserRelations(result[0]);
}

async function listUsers() {
  const result = await rows(
    `
      SELECT ${userPublicColumns}, ${joinedUserColumns}
      FROM usuarios u
      LEFT JOIN pilotos p ON p.usuario_id = u.id
      LEFT JOIN equipes t ON t.id = p.equipe_id OR (u.perfil = 'equipe' AND t.id = 1)
      LEFT JOIN pilotos d ON d.id = p.id
      ORDER BY u.id ASC
    `
  );

  return result.map((row) => attachUserRelations(row));
}

module.exports = { findUserById, findUserByUsername, listUsers };
