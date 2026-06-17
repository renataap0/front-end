const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const usersDao = require("../daos/usersDao");
const { AppError } = require("../utils/AppError");

async function login(username, password) {
  const user = await usersDao.findUserByUsername(username);

  if (!user) {
    throw new AppError("Usuario ou senha invalidos.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Usuario ou senha invalidos.", 401);
  }

  const token = jwt.sign(
    {
      username: user.username,
      role: user.role,
      teamId: user.teamId,
      driverId: user.driverId
    },
    env.jwtSecret,
    {
      subject: String(user.id),
      expiresIn: "8h"
    }
  );

  delete user.password;

  return { token, user };
}

module.exports = { login };
