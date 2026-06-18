const { ZodError } = require("zod");
const { AppError } = require("../utils/AppError");

function errorMiddleware(error, _request, response, _next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Dados invalidos.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (error?.type === "entity.parse.failed" && error?.status === 400) {
    return response.status(400).json({ message: "JSON invalido." });
  }

  if (error?.code === "ER_DUP_ENTRY") {
    return response.status(409).json({ message: "Registro duplicado." });
  }

  if (["ER_ROW_IS_REFERENCED_2", "ER_NO_REFERENCED_ROW_2"].includes(error?.code)) {
    return response.status(409).json({ message: "Registro possui vinculos e nao pode ser alterado ou removido." });
  }

  if ([
    "ER_BAD_NULL_ERROR",
    "ER_CHECK_CONSTRAINT_VIOLATED",
    "ER_DATA_TOO_LONG",
    "ER_TRUNCATED_WRONG_VALUE",
    "ER_WARN_DATA_OUT_OF_RANGE",
    "WARN_DATA_TRUNCATED"
  ].includes(error?.code)) {
    return response.status(400).json({ message: "Dados invalidos para o banco de dados." });
  }

  console.error(error);
  return response.status(500).json({ message: "Erro interno do servidor." });
}

module.exports = { errorMiddleware };
