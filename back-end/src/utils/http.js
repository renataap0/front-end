const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

function parseId(id) {
  return idParamSchema.parse({ id }).id;
}

function created(response, payload) {
  return response.status(201).json(payload);
}

function noContent(response) {
  return response.status(204).send();
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

module.exports = { created, noContent, parseId, parseOptionalNumber };
