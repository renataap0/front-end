const { toIso } = require("./helpers");

function hasId(row, prefix = "") {
  return row?.[`${prefix}id`] !== undefined && row?.[`${prefix}id`] !== null;
}

function mapTeam(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    country: row[`${prefix}country`],
    principal: row[`${prefix}principal`],
    foundedYear: row[`${prefix}foundedYear`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapDriver(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    nationality: row[`${prefix}nationality`],
    status: row[`${prefix}status`],
    number: row[`${prefix}number`],
    teamId: row[`${prefix}teamId`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapCar(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    model: row[`${prefix}model`],
    code: row[`${prefix}code`],
    teamId: row[`${prefix}teamId`],
    driverId: row[`${prefix}driverId`],
    power: row[`${prefix}power`],
    aero: row[`${prefix}aero`],
    reliability: row[`${prefix}reliability`],
    tireCare: row[`${prefix}tireCare`],
    ers: row[`${prefix}ers`],
    topSpeed: row[`${prefix}topSpeed`],
    weight: row[`${prefix}weight`],
    packageName: row[`${prefix}packageName`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapTrack(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    country: row[`${prefix}country`],
    city: row[`${prefix}city`],
    lengthKm: row[`${prefix}lengthKm`],
    turns: row[`${prefix}turns`],
    sectors: row[`${prefix}sectors`],
    recordLapMs: row[`${prefix}recordLapMs`],
    grip: row[`${prefix}grip`],
    elevation: row[`${prefix}elevation`],
    type: row[`${prefix}type`],
    weather: row[`${prefix}weather`],
    abrasion: row[`${prefix}abrasion`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapRace(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    status: row[`${prefix}status`],
    laps: row[`${prefix}laps`],
    bestLapMs: row[`${prefix}bestLapMs`],
    lastLapMs: row[`${prefix}lastLapMs`],
    raceDate: toIso(row[`${prefix}raceDate`]),
    teamId: row[`${prefix}teamId`],
    driverId: row[`${prefix}driverId`],
    trackId: row[`${prefix}trackId`],
    carId: row[`${prefix}carId`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapSeason(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    year: row[`${prefix}year`],
    status: row[`${prefix}status`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapSeasonRound(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    seasonId: row[`${prefix}seasonId`],
    raceId: row[`${prefix}raceId`],
    trackId: row[`${prefix}trackId`],
    name: row[`${prefix}name`],
    roundNumber: row[`${prefix}roundNumber`],
    scheduledAt: toIso(row[`${prefix}scheduledAt`]),
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapSeasonRoundLap(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    seasonRoundId: row[`${prefix}seasonRoundId`],
    driverId: row[`${prefix}driverId`],
    carId: row[`${prefix}carId`],
    lapNumber: row[`${prefix}lapNumber`],
    lapTimeMs: row[`${prefix}lapTimeMs`],
    createdAt: toIso(row[`${prefix}createdAt`])
  };
}

function mapProduct(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    name: row[`${prefix}name`],
    description: row[`${prefix}description`],
    price: Number(row[`${prefix}price`]),
    stock: row[`${prefix}stock`],
    imageUrl: row[`${prefix}imageUrl`],
    active: Boolean(row[`${prefix}active`]),
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapUser(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    username: row[`${prefix}username`],
    role: row[`${prefix}role`],
    teamId: row[`${prefix}teamId`],
    driverId: row[`${prefix}driverId`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapOrder(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    code: row[`${prefix}code`],
    userId: row[`${prefix}userId`],
    customerName: row[`${prefix}customerName`],
    customerEmail: row[`${prefix}customerEmail`],
    customerZip: row[`${prefix}customerZip`],
    paymentMethod: row[`${prefix}paymentMethod`],
    subtotal: Number(row[`${prefix}subtotal`]),
    shipping: Number(row[`${prefix}shipping`]),
    total: Number(row[`${prefix}total`]),
    status: row[`${prefix}status`],
    createdAt: toIso(row[`${prefix}createdAt`]),
    updatedAt: toIso(row[`${prefix}updatedAt`])
  };
}

function mapOrderItem(row, prefix = "") {
  if (!hasId(row, prefix)) return null;

  return {
    id: row[`${prefix}id`],
    orderId: row[`${prefix}orderId`],
    productId: row[`${prefix}productId`],
    quantity: row[`${prefix}quantity`],
    unitPrice: Number(row[`${prefix}unitPrice`]),
    total: Number(row[`${prefix}total`])
  };
}

module.exports = {
  mapCar,
  mapDriver,
  mapOrder,
  mapOrderItem,
  mapProduct,
  mapRace,
  mapSeason,
  mapSeasonRound,
  mapSeasonRoundLap,
  mapTeam,
  mapTrack,
  mapUser
};
