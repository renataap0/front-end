const usersDao = require("../daos/usersDao");
const { AppError } = require("../utils/AppError");

async function listUsers() {
  return usersDao.listUsers();
}

async function getMe(userId) {
  const user = await usersDao.findUserById(userId);

  if (!user) {
    throw new AppError("Usuario nao encontrado.", 404);
  }

  return user;
}

module.exports = { getMe, listUsers };
