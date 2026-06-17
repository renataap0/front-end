const { z } = require("zod");

const text = z.string().trim().min(1);
const optionalText = z.string().trim().optional();
const positiveInt = z.coerce.number().int().positive();
const nonNegativeInt = z.coerce.number().int().nonnegative();
const percent = z.coerce.number().int().min(0).max(100);
const booleanLike = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const teamCreateSchema = z.object({
  name: text,
  country: optionalText,
  principal: optionalText,
  foundedYear: z.coerce.number().int().min(1900).max(2100).optional()
});

const driverCreateSchema = z.object({
  name: text,
  nationality: optionalText,
  status: z.string().trim().default("Titular"),
  number: z.coerce.number().int().positive().optional(),
  teamId: positiveInt.optional()
});

const carCreateSchema = z.object({
  model: text,
  code: optionalText,
  teamId: positiveInt,
  driverId: positiveInt.optional().nullable(),
  power: positiveInt,
  aero: percent,
  reliability: percent,
  tireCare: percent,
  ers: percent,
  topSpeed: positiveInt,
  weight: positiveInt,
  packageName: optionalText
});

const trackCreateSchema = z.object({
  name: text,
  country: text,
  city: text,
  lengthKm: z.coerce.number().positive(),
  type: text.default("Mista"),
  turns: positiveInt.optional(),
  sectors: positiveInt.optional(),
  recordLapMs: positiveInt.optional(),
  grip: percent.optional(),
  elevation: nonNegativeInt.optional(),
  weather: optionalText,
  abrasion: percent.optional()
});

const raceCreateSchema = z.object({
  name: text,
  status: z.string().trim().default("Agendada"),
  laps: positiveInt,
  bestLapMs: positiveInt,
  lastLapMs: positiveInt,
  raceDate: z.coerce.date().optional().nullable(),
  teamId: positiveInt.optional(),
  driverId: positiveInt,
  trackId: positiveInt,
  carId: positiveInt
});

const seasonCreateSchema = z.object({
  name: text,
  year: z.coerce.number().int().min(2000).max(2100),
  status: z.string().trim().default("Ativa")
});

const seasonRoundCreateSchema = z.object({
  raceId: positiveInt.optional().nullable(),
  trackId: positiveInt,
  name: text,
  roundNumber: positiveInt,
  scheduledAt: z.coerce.date().optional().nullable()
});

const seasonRoundLapCreateSchema = z.object({
  driverId: positiveInt,
  carId: positiveInt.optional().nullable(),
  lapNumber: positiveInt,
  lapTimeMs: positiveInt
});

const seasonRoundLapsCreateSchema = z.object({
  laps: z.array(seasonRoundLapCreateSchema).min(1).max(500)
});

const productCreateSchema = z.object({
  name: text,
  description: optionalText,
  price: z.coerce.number().positive(),
  stock: nonNegativeInt,
  imageUrl: optionalText,
  active: booleanLike.optional()
});

const orderCreateSchema = z.object({
  customerName: text,
  customerEmail: z.string().email(),
  customerZip: z.string().trim().min(8),
  paymentMethod: text,
  items: z.array(
    z.object({
      productId: positiveInt,
      quantity: positiveInt
    })
  ).min(1)
});

module.exports = {
  carCreateSchema,
  carUpdateSchema: carCreateSchema.partial(),
  driverCreateSchema,
  driverUpdateSchema: driverCreateSchema.partial(),
  orderCreateSchema,
  productCreateSchema,
  productUpdateSchema: productCreateSchema.partial(),
  raceCreateSchema,
  raceUpdateSchema: raceCreateSchema.partial(),
  seasonCreateSchema,
  seasonRoundCreateSchema,
  seasonRoundLapCreateSchema,
  seasonRoundLapsCreateSchema,
  teamCreateSchema,
  teamUpdateSchema: teamCreateSchema.partial(),
  trackCreateSchema,
  trackUpdateSchema: trackCreateSchema.partial()
};
