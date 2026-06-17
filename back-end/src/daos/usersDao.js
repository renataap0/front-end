const { rows } = require("./helpers");
const { mapDriver, mapTeam, mapUser } = require("./mappers");

const userColumns = `
  u.id,
  u.username,
  u.password,
  u.role,
  u.team_id AS teamId,
  u.driver_id AS driverId,
  u.created_at AS createdAt,
  u.updated_at AS updatedAt
`;

const userPublicColumns = `
  u.id,
  u.username,
  u.role,
  u.team_id AS teamId,
  u.driver_id AS driverId,
  u.created_at AS createdAt,
  u.updated_at AS updatedAt
`;

const joinedUserColumns = `
  t.id AS team_id,
  t.name AS team_name,
  t.country AS team_country,
  t.principal AS team_principal,
  t.founded_year AS team_foundedYear,
  t.created_at AS team_createdAt,
  t.updated_at AS team_updatedAt,
  d.id AS driver_id,
  d.name AS driver_name,
  d.nationality AS driver_nationality,
  d.status AS driver_status,
  d.number AS driver_number,
  d.team_id AS driver_teamId,
  d.created_at AS driver_createdAt,
  d.updated_at AS driver_updatedAt
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
  return user;
}

async function findUserByUsername(username) {
  const result = await rows(
    `
      SELECT ${userColumns}, ${joinedUserColumns}
      FROM users u
      LEFT JOIN teams t ON t.id = u.team_id
      LEFT JOIN drivers d ON d.id = u.driver_id
      WHERE u.username = ?
    `,
    [username]
  );

  return attachUserRelations(result[0], true);
}

async function findUserById(id) {
  const result = await rows(
    `
      SELECT ${userPublicColumns}, ${joinedUserColumns}
      FROM users u
      LEFT JOIN teams t ON t.id = u.team_id
      LEFT JOIN drivers d ON d.id = u.driver_id
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
      FROM users u
      LEFT JOIN teams t ON t.id = u.team_id
      LEFT JOIN drivers d ON d.id = u.driver_id
      ORDER BY u.id ASC
    `
  );

  return result.map((row) => attachUserRelations(row));
}

module.exports = { findUserById, findUserByUsername, listUsers };
