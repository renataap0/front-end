const { AppError } = require("../utils/AppError");

function requireRole(...roles) {
  return (request, _response, next) => {
    const user = request.user;

    if (!user) {
      throw new AppError("Usuario nao autenticado.", 401);
    }

    if (!roles.includes(user.role)) {
      throw new AppError("Usuario sem permissao para esta acao.", 403);
    }

    return next();
  };
}

module.exports = { requireRole };
