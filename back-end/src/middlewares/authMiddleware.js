const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");

function authMiddleware(request, _response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Token JWT nao informado.", 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    request.user = {
      id: Number(decoded.sub),
      username: decoded.username,
      role: decoded.role,
      teamId: decoded.teamId ?? null,
      driverId: decoded.driverId ?? null
    };

    return next();
  } catch {
    throw new AppError("Token JWT invalido ou expirado.", 401);
  }
}

module.exports = { authMiddleware };
