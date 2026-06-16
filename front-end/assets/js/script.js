const canvas = document.getElementById("particlesCanvas");

const ctx = canvas.getContext("2d");
const speedValue = document.getElementById("speedValue");
const speedReadout = document.getElementById("speedReadout");
const speedNeedle = document.getElementById("speedNeedle");
const speedProgress = document.getElementById("speedProgress");
const menuToggle = document.querySelector(".menu-toggle");
const mainMenu = document.getElementById("mainMenu");
const revealCards = document.querySelectorAll(".reveal-card");

const targetSpeed = 312;
const maxSpeed = 360;
const progressLength = 267;
const currentTeam = "Racing Angels";
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
let activeGridIndex = 0;
let activeTrackIndex = 0;
let monitorTimer = null;
let trackMonitorTimer = null;

const roles = {
  driver: {
    label: "Corredor",
    loginText: "Entrar como Corredor",
    feedback: "Perfil Corredor pronto para acesso.",
    signedIn: "Sessao iniciada como Corredor.",
    chip: "Modo visualizacao",
    canAddRace: false,
    canEditDrivers: false,
    canDeleteRace: false,
    canManageTracks: false
  },
  team: {
    label: "Equipe",
    loginText: "Entrar como Equipe",
    feedback: "Perfil Equipe pronto para operacao.",
    signedIn: "Sessao iniciada como Equipe.",
    chip: "Gestao de equipe",
    canAddRace: true,
    canEditDrivers: true,
    canDeleteRace: false,
    canManageTracks: true
  },
  admin: {
    label: "Admin",
    loginText: "Entrar como Admin",
    feedback: "Perfil Admin pronto para controle total.",
    signedIn: "Sessao iniciada como Admin.",
    chip: "Controle total",
    canAddRace: true,
    canEditDrivers: true,
    canDeleteRace: true,
    canManageTracks: true
  }
};

const storageKeys = {
  role: "racingAngelsRole",
  user: "racingAngelsUser",
  token: "racingAngelsToken",

  races: "racingAngelsRaces",
  drivers: "racingAngelsDrivers",
  tracks: "racingAngelsTracks",
  cars: "racingAngelsCars",
  trackCars: "racingAngelsTrackCars",
  products: "racingAngelsProducts",

  season: "racingAngelsSeason",

  cart: "racingAngelsCart",
  orders: "racingAngelsOrders"
};

const API_BASE_URL = window.API_BASE_URL || "http://localhost:3333/api";
const apiState = {
  lastSyncAt: null,
  syncError: null
};

const roleCredentials = {
  driver: { username: "corredor", password: "123456" },
  team: { username: "equipe", password: "123456" },
  admin: { username: "admin", password: "123456" }
};


const defaultRaces = [
  {
    id: 1,
    race: "Interlagos GP",
    driver: "Raphael Galhardo",
    team: currentTeam,
    laps: 42,
    bestLap: "1:21.348",
    lastLap: "1:22.005",
    status: "Finalizada"
  },
  {
    id: 2,
    race: "Monaco Night Run",
    driver: "Renata Queiroz",
    team: "Sakura Racing",
    laps: 39,
    bestLap: "1:12.908",
    lastLap: "1:13.210",
    status: "Finalizada"
  },
  {
    id: 3,
    race: "Spa Aero Test",
    driver: "Rafaela Santana",
    team: "Apex Storms",
    laps: 31,
    bestLap: "1:44.210",
    lastLap: "1:45.010",
    status: "Treino"
  },
  {
    id: 4,
    race: "Suzuka Data Cup",
    driver: "Luca Guidoni",
    team: "Apex Racing",
    laps: 36,
    bestLap: "1:29.771",
    lastLap: "1:30.402",
    status: "Finalizada"
  }
];

const defaultDrivers = [
  {
    name: "Raphael Galhardo",
    car: "RA-07",
    status: "Titular"
  },
  {
    name: "Renata Queiroz",
    car: "RA-11",
    status: "Titular"
  },
  {
    name: "Rafaela Santana",
    car: "RA-21",
    status: "Reserva"
  }
];

const defaultTracks = [
  {
    id: 1,
    name: "Interlagos",
    country: "Brasil",
    city: "Sao Paulo",
    lengthKm: 4.309,
    turns: 15,
    sectors: 3,
    record: "1:10.540",
    grip: 86,
    elevation: 43,
    type: "Misto",
    weather: "Instavel",
    abrasion: 72
  },
  {
    id: 2,
    name: "Monaco",
    country: "Monaco",
    city: "Monte Carlo",
    lengthKm: 3.337,
    turns: 19,
    sectors: 3,
    record: "1:12.908",
    grip: 78,
    elevation: 42,
    type: "Rua",
    weather: "Seco",
    abrasion: 48
  },
  {
    id: 3,
    name: "Spa",
    country: "Belgica",
    city: "Stavelot",
    lengthKm: 7.004,
    turns: 19,
    sectors: 3,
    record: "1:44.210",
    grip: 83,
    elevation: 102,
    type: "Alta velocidade",
    weather: "Instavel",
    abrasion: 67
  },
  {
    id: 4,
    name: "Suzuka",
    country: "Japao",
    city: "Suzuka",
    lengthKm: 5.807,
    turns: 18,
    sectors: 3,
    record: "1:29.771",
    grip: 84,
    elevation: 40,
    type: "Tecnico",
    weather: "Umido",
    abrasion: 62
  },
  {
    id: 5,
    name: "Silverstone",
    country: "Reino Unido",
    city: "Towcester",
    lengthKm: 5.891,
    turns: 18,
    sectors: 3,
    record: "1:27.097",
    grip: 88,
    elevation: 11,
    type: "Rapido",
    weather: "Frio",
    abrasion: 58
  }
];

const defaultCars = [
  {
    id: 1,
    model: "RA-07 Halo",
    driver: "Raphael Galhardo",
    team: currentTeam,
    power: 1018,
    aero: 92,
    reliability: 94,
    tireCare: 86,
    ers: 88,
    topSpeed: 334,
    weight: 796,
    package: "Aero balanceado"
  },
  {
    id: 2,
    model: "RA-11 Sprint",
    driver: "Renata Queiroz",
    team: "Sakura Racing",
    power: 1006,
    aero: 88,
    reliability: 91,
    tireCare: 90,
    ers: 84,
    topSpeed: 329,
    weight: 798,
    package: "Tracao e pneus"
  },
  {
    id: 3,
    model: "RA-X Reserve",
    driver: "Rafaela Santana",
    team: "Apex Storms",
    power: 998,
    aero: 86,
    reliability: 96,
    tireCare: 84,
    ers: 82,
    topSpeed: 326,
    weight: 801,
    package: "Confiabilidade"
  },
  {
    id: 4,
    model: "OA-01 Apex",
    driver: "Luca Guidoni",
    team: "Apex Racing",
    power: 1002,
    aero: 87,
    reliability: 89,
    tireCare: 82,
    ers: 83,
    topSpeed: 328,
    weight: 800,
    package: "Reta longa"
  }
];

const defaultTrackCars = [
  {
    id: 1,
    driver: "Raphael Galhardo",
    team: currentTeam,
    carNumber: "07",
    race: "Interlagos GP",
    bestLap: "1:21.348",
    lastLap: "1:22.005",
    status: "Na pista",
    sector: "S2",
    x: 590,
    y: 80,
    angle: -20
  },
  {
    id: 2,
    driver: "Renata Queiroz",
    team: "Sakura Racing",
    carNumber: "11",
    race: "Interlagos GP",
    bestLap: "1:22.114",
    lastLap: "1:22.880",
    status: "Na pista",
    sector: "S3",
    x: 655,
    y: 210,
    angle: 78
  },
  {
    id: 3,
    driver: "Rafaela Santana",
    team: "Apex Storms",
    carNumber: "21",
    race: "Interlagos GP",
    bestLap: "1:23.004",
    lastLap: "1:23.552",
    status: "Na pista",
    sector: "S3",
    x: 454,
    y: 320,
    angle: 180
  },
  {
    id: 4,
    driver: "Luca Guidoni",
    team: "Apex Racing",
    carNumber: "34",
    race: "Interlagos GP",
    bestLap: "1:24.220",
    lastLap: "1:24.801",
    status: "Box radio",
    sector: "S1",
    x: 245,
    y: 354,
    angle: 204
  },
  {
    id: 5,
    driver: "Gabriela Basilio",
    team: "Kerberus",
    carNumber: "44",
    race: "Interlagos GP",
    bestLap: "1:24.901",
    lastLap: "1:25.330",
    status: "Na pista",
    sector: "S1",
    x: 131,
    y: 218,
    angle: -80
  },
  {
    id: 6,
    driver: "Murilo Araujo",
    team: "Wind Speed",
    carNumber: "55",
    race: "Interlagos GP",
    bestLap: "1:25.104",
    lastLap: "1:25.780",
    status: "Na pista",
    sector: "S2",
    x: 330,
    y: 114,
    angle: -12
  },
  {
    id: 7,
    driver: "Ryan Soares",
    team: "Cowabunga",
    carNumber: "66",
    race: "Interlagos GP",
    bestLap: "1:25.840",
    lastLap: "1:26.110",
    status: "Na pista",
    sector: "S2",
    x: 500,
    y: 115,
    angle: 16
  },
  {
    id: 8,
    driver: "Vitor Guimaraes",
    team: "Septem",
    carNumber: "77",
    race: "Interlagos GP",
    bestLap: "1:26.300",
    lastLap: "1:26.950",
    status: "Na pista",
    sector: "S3",
    x: 560,
    y: 300,
    angle: 145
  }
];

function resizeCanvas() {
  deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = Math.floor(canvasWidth * deviceRatio);
  canvas.height = Math.floor(canvasHeight * deviceRatio);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
  createParticles();
}

// Gera partÃ­culas leves e recalcula a quantidade conforme a largura da tela.
function resetParticle(particle = {}, initial = false) {
  const depth = Math.random() * 0.85 + 0.35;
  const length = (Math.random() * 11 + 7) * depth;

  return Object.assign(particle, {
    x: Math.random() * canvasWidth,
    y: initial ? Math.random() * canvasHeight : -length - Math.random() * 80,
    length,
    width: (Math.random() * 2.1 + 1) * depth,
    speed: Math.random() * 0.65 + 0.3,
    drift: Math.random() * 0.42 - 0.21,
    alpha: Math.random() * 0.28 + 0.1,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    phase: Math.random() * Math.PI * 2,
    depth,
    hue: Math.random() * 8 + 37
  });
}

function createParticles() {
  const amount = Math.min(520, Math.max(190, Math.floor((canvasWidth * canvasHeight) / 6200)));

  particles = Array.from({ length: amount }, () => resetParticle({}, true));
}

// requestAnimationFrame mantÃ©m o fundo suave e sincronizado com o navegador.
function drawGoldFeather(particle) {
  const glow = particle.width * 3.2;
  const lightness = 52 + particle.depth * 15;
  const coreColor = `hsla(${particle.hue}, 58%, ${lightness}%, ${particle.alpha})`;
  const edgeColor = `hsla(${particle.hue + 5}, 52%, 70%, ${particle.alpha * 0.2})`;

  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.scale(1, 0.78 + Math.sin(particle.phase) * 0.12);

  const gradient = ctx.createLinearGradient(0, -particle.length / 2, 0, particle.length / 2);
  gradient.addColorStop(0, edgeColor);
  gradient.addColorStop(0.35, coreColor);
  gradient.addColorStop(1, `hsla(${particle.hue - 4}, 55%, 42%, ${particle.alpha * 0.08})`);

  ctx.shadowBlur = glow;
  ctx.shadowColor = `hsla(${particle.hue}, 58%, 55%, ${particle.alpha})`;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -particle.length / 2);
  ctx.bezierCurveTo(
    particle.width * 2.1,
    -particle.length * 0.22,
    particle.width * 1.35,
    particle.length * 0.28,
    0,
    particle.length / 2
  );
  ctx.bezierCurveTo(
    -particle.width * 1.75,
    particle.length * 0.2,
    -particle.width * 1.1,
    -particle.length * 0.32,
    0,
    -particle.length / 2
  );
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = `hsla(${particle.hue + 6}, 52%, 78%, ${particle.alpha * 0.75})`;
  ctx.lineWidth = Math.max(0.45, particle.width * 0.22);
  ctx.beginPath();
  ctx.moveTo(0, -particle.length / 2.3);
  ctx.lineTo(0, particle.length / 2.2);
  ctx.stroke();

  ctx.restore();
}

function drawParticles() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalCompositeOperation = "lighter";

  for (const particle of particles) {
    particle.phase += 0.018 + particle.depth * 0.005;
    particle.rotation += particle.spin;
    particle.y += particle.speed * (0.85 + particle.depth);
    particle.x += particle.drift + Math.sin(particle.phase) * 0.32;

    if (particle.y > canvasHeight + particle.length + 20) {
      resetParticle(particle);
    }

    if (particle.x < -40) {
      particle.x = canvasWidth + 40;
    } else if (particle.x > canvasWidth + 40) {
      particle.x = -40;
    }

    drawGoldFeather(particle);
  }

  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(drawParticles);
}

function readJSON(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isApiAuthenticated() {
  return Boolean(localStorage.getItem(storageKeys.token));
}

async function callApi(path, options = {}) {
  if (typeof window.apiFetch === "function") {
    return window.apiFetch(path, options);
  }

  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const token = localStorage.getItem(storageKeys.token);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, options, { headers }));

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Erro ao chamar API.");
  }

  return data;
}

function lapMsToText(value) {
  const milliseconds = Number(value);
  return Number.isFinite(milliseconds) ? formatMilliseconds(milliseconds) : "--";
}

function normalizeApiRace(race) {
  return {
    id: race.id,
    race: race.name || race.race || "Corrida",
    driver: race.driver?.name || race.driverName || "Piloto",
    team: race.team?.name || race.teamName || currentTeam,
    laps: Number(race.laps) || 0,
    bestLap: lapMsToText(race.bestLapMs ?? race.bestLap),
    lastLap: lapMsToText(race.lastLapMs ?? race.lastLap),
    status: race.status || "Registrada",
    track: race.track?.name || race.trackName || "",
    car: race.car?.model || race.carModel || "",
    teamId: race.teamId || race.team?.id,
    driverId: race.driverId || race.driver?.id,
    trackId: race.trackId || race.track?.id,
    carId: race.carId || race.car?.id
  };
}

function normalizeApiDriver(driver) {
  const primaryCar = Array.isArray(driver.cars) ? driver.cars[0] : driver.car;

  return {
    id: driver.id,
    name: driver.name,
    car: primaryCar?.code || primaryCar?.model || driver.car || "Pacote livre",
    status: driver.status || "Titular",
    number: driver.number,
    team: driver.team?.name || currentTeam,
    teamId: driver.teamId || driver.team?.id
  };
}

function normalizeApiTrack(track) {
  return {
    id: track.id,
    name: track.name,
    country: track.country,
    city: track.city,
    lengthKm: Number(track.lengthKm) || 0,
    turns: Number(track.turns) || 0,
    sectors: Number(track.sectors) || 0,
    record: lapMsToText(track.recordLapMs ?? track.record),
    grip: Number(track.grip) || 0,
    elevation: Number(track.elevation) || 0,
    type: track.type || "Misto",
    weather: track.weather || "Variavel",
    abrasion: Number(track.abrasion) || 0
  };
}

function normalizeApiCar(car) {
  return {
    id: car.id,
    model: car.model,
    driver: car.driver?.name || "Livre",
    team: car.team?.name || currentTeam,
    driverId: car.driverId || car.driver?.id,
    teamId: car.teamId || car.team?.id,
    power: Number(car.power) || 0,
    aero: Number(car.aero) || 0,
    reliability: Number(car.reliability) || 0,
    tireCare: Number(car.tireCare) || 0,
    ers: Number(car.ers) || 0,
    topSpeed: Number(car.topSpeed) || 0,
    weight: Number(car.weight) || 0,
    package: car.packageName || car.package || "Pacote tecnico"
  };
}

function normalizeApiProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    imageUrl: product.imageUrl || ""
  };
}

function upsertById(items, nextItem) {
  if (!nextItem?.id) {
    return items;
  }

  const nextItems = [...items];
  const index = nextItems.findIndex((item) => Number(item.id) === Number(nextItem.id));

  if (index >= 0) {
    nextItems[index] = nextItem;
  } else {
    nextItems.push(nextItem);
  }

  return nextItems;
}

function getProducts() {
  return readJSON(storageKeys.products, []);
}

function saveProducts(products) {
  writeJSON(storageKeys.products, products);
}

async function syncApiData() {
  if (!isApiAuthenticated()) {
    return false;
  }

  try {
    const [drivers, cars, tracks, races, products] = await Promise.all([
      (window.getDriversApi || (() => callApi("/drivers")))(),
      (window.getCarsApi || (() => callApi("/cars")))(),
      (window.getTracksApi || (() => callApi("/tracks")))(),
      (window.getRacesApi || (() => callApi("/races")))(),
      (window.getProductsApi || (() => callApi("/products")))({ active: true })
    ]);

    if (Array.isArray(drivers)) {
      saveDrivers(drivers.map(normalizeApiDriver));
    }

    if (Array.isArray(cars)) {
      saveCars(cars.map(normalizeApiCar));
    }

    if (Array.isArray(tracks)) {
      saveTracks(tracks.map(normalizeApiTrack));
    }

    if (Array.isArray(races)) {
      saveRaces(races.map(normalizeApiRace));
    }

    if (Array.isArray(products)) {
      saveProducts(products.map(normalizeApiProduct));
    }

    apiState.lastSyncAt = new Date().toISOString();
    apiState.syncError = null;
    return true;
  } catch (error) {
    apiState.syncError = error;
    console.warn("API indisponivel; usando cache local.", error);
    return false;
  }
}

function renderApiBackedViews() {
  updateDashboardMetrics();
  renderDriverEditors();
  renderTrackCars();
  updateTrackMonitor();
  renderGridPage();
  updateCarMonitor();
  renderAnalyticsPage();
  renderTrackList();
}

function findByNormalizedName(items, name) {
  const key = normalizeKey(name);

  return items.find((item) => normalizeKey(item.name) === key)
    || items.find((item) => key.includes(normalizeKey(item.name)) || normalizeKey(item.name).includes(key));
}

function buildRaceApiPayload(race) {
  const drivers = getDrivers();
  const tracks = getTracks();
  const cars = getCars();
  const driver = findByNormalizedName(drivers, race.driver);
  const track = findByNormalizedName(tracks, race.track || inferTrackName(race.race, tracks));
  const driverKey = normalizeKey(race.driver);
  const car = cars.find((item) => Number(item.driverId) === Number(driver?.id))
    || cars.find((item) => normalizeKey(item.driver) === driverKey)
    || cars[0];

  if (!driver?.id || !track?.id || !car?.id) {
    return null;
  }

  const payload = {
    name: race.race,
    status: race.status || "Manual",
    laps: Number(race.laps) || 1,
    bestLapMs: Math.round(parseLapTime(race.bestLap)),
    lastLapMs: Math.round(parseLapTime(race.lastLap)),
    driverId: Number(driver.id),
    trackId: Number(track.id),
    carId: Number(car.id)
  };

  if (driver.teamId) {
    payload.teamId = Number(driver.teamId);
  }

  return payload;
}

async function persistRaceToApi(race) {
  if (!isApiAuthenticated() || typeof window.createRaceApi !== "function") {
    return null;
  }

  const payload = buildRaceApiPayload(race);

  if (!payload) {
    throw new Error("Nao encontrei piloto, pista ou carro com ID do banco para gravar a corrida.");
  }

  const persistedRace = normalizeApiRace(await window.createRaceApi(payload));
  saveRaces(upsertById(getRaces(), persistedRace));
  return persistedRace;
}

function buildTrackApiPayload(track) {
  return {
    name: track.name,
    country: track.country,
    city: track.city,
    lengthKm: Number(track.lengthKm),
    turns: Number(track.turns),
    sectors: Number(track.sectors),
    recordLapMs: Math.round(parseLapTime(track.record)),
    grip: Number(track.grip),
    elevation: Number(track.elevation),
    type: track.type,
    weather: track.weather,
    abrasion: Number(track.abrasion)
  };
}

async function persistTrackToApi(track, existingTrack) {
  if (!isApiAuthenticated()) {
    return null;
  }

  const payload = buildTrackApiPayload(track);
  const canUpdate = existingTrack?.id && typeof window.updateTrackApi === "function";
  const persistedTrack = canUpdate
    ? await window.updateTrackApi(existingTrack.id, payload)
    : await window.createTrackApi(payload);
  const normalizedTrack = normalizeApiTrack(persistedTrack);

  saveTracks(upsertById(getTracks(), normalizedTrack));
  return normalizedTrack;
}

async function deleteRaceFromApi(raceId) {
  if (isApiAuthenticated() && typeof window.deleteRaceApi === "function") {
    await window.deleteRaceApi(raceId);
  }
}

async function deleteTrackFromApi(trackId) {
  if (isApiAuthenticated() && typeof window.deleteTrackApi === "function") {
    await window.deleteTrackApi(trackId);
  }
}

async function updateDriverOnApi(driver, field, value) {
  if (!isApiAuthenticated() || !driver?.id || typeof window.updateDriverApi !== "function") {
    return null;
  }

  if (!["name", "status"].includes(field)) {
    return null;
  }

  return window.updateDriverApi(driver.id, { [field]: value });
}

async function createOrderOnApi(order, cart, productsByName) {
  if (!isApiAuthenticated() || typeof window.createOrderApi !== "function") {
    return null;
  }

  const items = cart.map((item) => ({
    productId: Number(item.productId || productsByName[item.name]?.id),
    quantity: Math.max(1, Number(item.quantity) || 1)
  }));

  if (items.some((item) => !item.productId)) {
    throw new Error("Produtos do carrinho ainda nao possuem ID do banco. Entre no portal e recarregue a loja.");
  }

  return window.createOrderApi({
    customerName: order.customer,
    customerEmail: order.email,
    customerZip: order.zip,
    paymentMethod: order.payment,
    items
  });
}

function getCurrentRole() {
  return localStorage.getItem(storageKeys.role) || "driver";
}

function getRoleConfig() {
  return roles[getCurrentRole()] || roles.driver;
}

function getRaces() {
  return readJSON(storageKeys.races, defaultRaces);
}

function saveRaces(races) {
  writeJSON(storageKeys.races, races);
}

const DEFAULT_SEASON = {
  version: 1,
  createdAt: new Date().toISOString(),
  rounds: []
};

function getSeason() {
  const stored = readJSON(storageKeys.season, null);

  if (!stored || typeof stored !== "object") {
    return structuredClone(DEFAULT_SEASON);
  }

  // normaliza shape
  return {
    version: Number(stored.version) || 1,
    createdAt: stored.createdAt || new Date().toISOString(),
    rounds: Array.isArray(stored.rounds) ? stored.rounds : []
  };
}

function saveSeason(season) {
  writeJSON(storageKeys.season, season);
}


function getDrivers() {
  return readJSON(storageKeys.drivers, defaultDrivers);
}

function saveDrivers(drivers) {
  writeJSON(storageKeys.drivers, drivers);
}

function getTracks() {
  return readJSON(storageKeys.tracks, defaultTracks);
}

function saveTracks(tracks) {
  writeJSON(storageKeys.tracks, tracks);
}

function getCars() {
  return readJSON(storageKeys.cars, defaultCars);
}

function saveCars(cars) {
  writeJSON(storageKeys.cars, cars);
}

function getSavedTrackCars() {
  return readJSON(storageKeys.trackCars, defaultTrackCars);
}

function saveTrackCars(cars) {
  writeJSON(storageKeys.trackCars, cars);
}

function escapeHTML(value) {
  const parser = document.createElement("span");
  parser.textContent = String(value);
  return parser.innerHTML;
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function parseLapTime(value) {
  const cleanValue = String(value).trim();
  const parts = cleanValue.split(":");
  let milliseconds = Number(cleanValue) * 1000;

  if (parts.length === 2) {
    milliseconds = Number(parts[0]) * 60000 + Number(parts[1]) * 1000;
  }

  return Number.isFinite(milliseconds) ? milliseconds : Number.POSITIVE_INFINITY;
}

function formatMilliseconds(milliseconds) {
  if (!Number.isFinite(milliseconds)) {
    return "--";
  }

  const roundedMilliseconds = Math.round(milliseconds);
  const minutes = Math.floor(roundedMilliseconds / 60000);
  const seconds = Math.floor((roundedMilliseconds % 60000) / 1000);
  const millis = roundedMilliseconds % 1000;

  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (!validValues.length) {
    return Number.POSITIVE_INFINITY;
  }

  return validValues.reduce((total, value) => total + value, 0) / validValues.length;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function normalizeKey(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getDigits(value) {
  return String(value).replace(/\D/g, "");
}

function formatDecimalInput(value) {
  const cleanValue = String(value)
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const pieces = cleanValue.split(".");
  const whole = pieces[0].slice(0, 2);
  const decimal = pieces.slice(1).join("").slice(0, 3);

  if (!decimal) {
    return whole;
  }

  return `${whole}.${decimal}`;
}

function getLapDigits(value) {
  const rawDigits = getDigits(value);
  let digits = "";

  for (const digit of rawDigits) {
    if (digits.length === 1 && Number(digit) > 5) {
      continue;
    }

    digits += digit;

    if (digits.length === 6) {
      break;
    }
  }

  return digits;
}

function formatLapDigits(value) {
  const digits = getLapDigits(value);
  const minutes = digits.slice(0, 1);
  const seconds = digits.slice(1, 3);
  const milliseconds = digits.slice(3, 6);

  if (!digits) {
    return "";
  }

  if (digits.length <= 1) {
    return minutes;
  }

  if (digits.length <= 3) {
    return `${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}.${milliseconds}`;
}

function isCompleteLapTime(value) {
  const digits = getLapDigits(value);
  const seconds = Number(digits.slice(1, 3));

  return digits.length === 6 && Number.isFinite(seconds) && seconds <= 59;
}

function sanitizeName(value) {
  return String(value)
    .replace(/[^\p{L}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/, "");
}

function sanitizeTitle(value) {
  return String(value)
    .replace(/[^\p{L}\p{N}\s'-.]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/, "");
}

function titleCaseWords(value) {
  return String(value).replace(/\p{L}[\p{L}'-]*/gu, (word) => {
    return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1).toLocaleLowerCase("pt-BR");
  });
}

function setupRaceInputMasks(manualRaceForm) {
  const maskedFields = manualRaceForm.querySelectorAll("[data-mask]");

  maskedFields.forEach((field) => {
    field.addEventListener("input", () => {
      const mask = field.dataset.mask;

      if (mask === "lap") {
        field.value = formatLapDigits(field.value);
      }

      if (mask === "integer") {
        field.value = getDigits(field.value).slice(0, 3);
      }

      if (mask === "decimal") {
        field.value = formatDecimalInput(field.value);
      }

      if (mask === "percent") {
        field.value = String(clampNumber(getDigits(field.value).slice(0, 3), 0, 100));
      }

      if (mask === "name") {
        field.value = sanitizeName(field.value);
      }

      if (mask === "title") {
        field.value = sanitizeTitle(field.value);
      }
    });

    field.addEventListener("blur", () => {
      if (field.dataset.mask === "name" || field.dataset.mask === "title") {
        field.value = titleCaseWords(field.value.trim());
      }
    });
  });
}

function formatRaceCount(total) {
  return `${total} ${total === 1 ? "corrida" : "corridas"}`;
}

function getVisibleRaces() {
  const role = getCurrentRole();
  const races = getRaces();

  if (role === "admin") {
    return races;
  }

  return races.filter((race) => race.team === currentTeam);
}

function getRankedRaces() {
  return [...getVisibleRaces()].sort((first, second) => {
    return parseLapTime(first.bestLap) - parseLapTime(second.bestLap);
  });
}

function getGridRaces() {
  const rankedRaces = getRankedRaces();

  if (rankedRaces.length) {
    return rankedRaces;
  }

  return [...defaultRaces].sort((first, second) => {
    return parseLapTime(first.bestLap) - parseLapTime(second.bestLap);
  });
}

function getAnalysisRaces() {
  return getRaces().filter((race) => Number.isFinite(parseLapTime(race.bestLap)));
}

function getRankedAnalysisRaces() {
  return [...getAnalysisRaces()].sort((first, second) => {
    return parseLapTime(first.bestLap) - parseLapTime(second.bestLap);
  });
}

function inferTrackName(raceName, tracks = getTracks()) {
  const raceKey = normalizeKey(raceName);
  const matchedTrack = tracks.find((track) => raceKey.includes(normalizeKey(track.name)));

  if (matchedTrack) {
    return matchedTrack.name;
  }

  return String(raceName).trim().split(/\s+/)[0] || "Pista livre";
}

function getRaceTrackName(race, tracks = getTracks()) {
  return race.track || inferTrackName(race.race, tracks);
}

function getRaceCarModel(race, cars = getCars(), drivers = getDrivers()) {
  if (race.car) {
    return race.car;
  }

  const driverKey = normalizeKey(race.driver);
  const driverProfile = drivers.find((driver) => normalizeKey(driver.name) === driverKey);
  const carProfile = cars.find((car) => normalizeKey(car.driver) === driverKey);

  return driverProfile?.car || carProfile?.model || "Pacote livre";
}

function buildDriverStats(races = getAnalysisRaces()) {
  const pointSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const rankedRaces = [...races].sort((first, second) => parseLapTime(first.bestLap) - parseLapTime(second.bestLap));
  const stats = new Map();

  races.forEach((race) => {
    const driverKey = normalizeKey(race.driver);
    const bestLapMs = parseLapTime(race.bestLap);
    const lastLapMs = parseLapTime(race.lastLap);

    if (!stats.has(driverKey)) {
      stats.set(driverKey, {
        name: race.driver,
        teams: new Set(),
        races: 0,
        laps: 0,
        points: 0,
        bestLapMs: Number.POSITIVE_INFINITY,
        bestLap: "--",
        bestRace: "--",
        bestSamples: [],
        consistencySamples: []
      });
    }

    const driverStats = stats.get(driverKey);
    driverStats.teams.add(race.team);
    driverStats.races += 1;
    driverStats.laps += Number(race.laps) || 0;
    driverStats.bestSamples.push(bestLapMs);

    if (Number.isFinite(lastLapMs)) {
      driverStats.consistencySamples.push(Math.abs(lastLapMs - bestLapMs));
    }

    if (bestLapMs < driverStats.bestLapMs) {
      driverStats.bestLapMs = bestLapMs;
      driverStats.bestLap = race.bestLap;
      driverStats.bestRace = race.race;
    }
  });

  rankedRaces.forEach((race, index) => {
    const driverStats = stats.get(normalizeKey(race.driver));

    if (driverStats) {
      driverStats.points += pointSystem[index] || 1;
    }
  });

  return Array.from(stats.values())
    .map((driverStats) => ({
      ...driverStats,
      teamsLabel: Array.from(driverStats.teams).join(", "),
      avgBestMs: average(driverStats.bestSamples),
      avgBestLap: formatMilliseconds(average(driverStats.bestSamples)),
      consistencyMs: average(driverStats.consistencySamples),
      consistency: Number.isFinite(average(driverStats.consistencySamples))
        ? `+${(average(driverStats.consistencySamples) / 1000).toFixed(3)}s`
        : "--"
    }))
    .sort((first, second) => first.avgBestMs - second.avgBestMs);
}

function buildTrackStats(races = getAnalysisRaces(), tracks = getTracks()) {
  return tracks
    .map((track) => {
      const trackKey = normalizeKey(track.name);
      const samples = races.filter((race) => {
        return normalizeKey(getRaceTrackName(race, tracks)) === trackKey || normalizeKey(race.race).includes(trackKey);
      });
      const lapSamples = samples.map((race) => parseLapTime(race.bestLap)).filter(Number.isFinite);
      const recordMs = parseLapTime(track.record);
      const avgBestMs = lapSamples.length ? average(lapSamples) : recordMs;
      const bestLapMs = lapSamples.length ? Math.min(...lapSamples) : recordMs;
      const lengthKm = Number(track.lengthKm) || 0;
      const secondsPerKm = lengthKm ? avgBestMs / 1000 / lengthKm : Number.POSITIVE_INFINITY;
      const efficiency = Number.isFinite(secondsPerKm)
        ? Math.round(clampNumber(132 - secondsPerKm * 3 + track.grip * 0.13 - track.abrasion * 0.05, 1, 100))
        : 0;

      return {
        ...track,
        samples,
        races: samples.length,
        avgBestMs,
        avgBestLap: formatMilliseconds(avgBestMs),
        bestLapMs,
        bestLap: formatMilliseconds(bestLapMs),
        secondsPerKm,
        efficiency
      };
    })
    .sort((first, second) => first.secondsPerKm - second.secondsPerKm);
}

function calculateCarScore(car) {
  const score =
    35 +
    (Number(car.power) - 900) * 0.11 +
    Number(car.aero) * 0.22 +
    Number(car.reliability) * 0.2 +
    Number(car.tireCare) * 0.16 +
    Number(car.ers) * 0.14 +
    (Number(car.topSpeed) - 300) * 0.08 -
    (Number(car.weight) - 790) * 0.05;

  return Math.round(clampNumber(score, 1, 100));
}

function buildCarStats(races = getAnalysisRaces(), cars = getCars()) {
  const drivers = getDrivers();

  return cars
    .map((car) => {
      const modelKey = normalizeKey(car.model);
      const shortModelKey = normalizeKey(String(car.model).split(" ")[0]);
      const driverKey = normalizeKey(car.driver);
      const samples = races.filter((race) => {
        const raceCarKey = normalizeKey(getRaceCarModel(race, cars, drivers));
        const raceDriverKey = normalizeKey(race.driver);

        return raceDriverKey === driverKey || raceCarKey.includes(shortModelKey) || raceCarKey.includes(modelKey);
      });
      const lapSamples = samples.map((race) => parseLapTime(race.bestLap)).filter(Number.isFinite);
      const avgBestMs = average(lapSamples);
      const bestLapMs = lapSamples.length ? Math.min(...lapSamples) : Number.POSITIVE_INFINITY;

      return {
        ...car,
        races: samples.length,
        avgBestMs,
        avgBestLap: formatMilliseconds(avgBestMs),
        bestLapMs,
        bestLap: formatMilliseconds(bestLapMs),
        score: calculateCarScore(car)
      };
    })
    .sort((first, second) => {
      if (Number.isFinite(first.avgBestMs) && Number.isFinite(second.avgBestMs)) {
        return first.avgBestMs - second.avgBestMs;
      }

      if (Number.isFinite(first.avgBestMs)) {
        return -1;
      }

      if (Number.isFinite(second.avgBestMs)) {
        return 1;
      }

      return second.score - first.score;
    });
}

function getCarNumber(driver, index) {
  const seed = Array.from(driver).reduce((total, letter) => total + letter.charCodeAt(0), 0);
  return String((seed + index * 11) % 89 + 10).padStart(2, "0");
}

const trackCarPoints = [
  { x: 590, y: 80, sector: "S2", angle: -20 },
  { x: 655, y: 210, sector: "S3", angle: 78 },
  { x: 454, y: 320, sector: "S3", angle: 180 },
  { x: 245, y: 354, sector: "S1", angle: 204 },
  { x: 131, y: 218, sector: "S1", angle: -80 },
  { x: 330, y: 114, sector: "S2", angle: -12 },
  { x: 500, y: 115, sector: "S2", angle: 16 },
  { x: 560, y: 300, sector: "S3", angle: 145 }
];

function getTrackCars() {
  return getSavedTrackCars().map((car, index) => {
    const point = trackCarPoints[index % trackCarPoints.length];
    const lapOffset = Math.min(index * 370, 7200);

    return {
      race: "Interlagos GP",
      bestLap: formatMilliseconds(81348 + lapOffset),
      lastLap: formatMilliseconds(82005 + lapOffset),
      status: "Na pista",
      ...car,
      x: Number(car.x) || point.x,
      y: Number(car.y) || point.y,
      angle: Number.isFinite(Number(car.angle)) ? Number(car.angle) : point.angle,
      sector: car.sector || point.sector,
      carNumber: String(car.carNumber || getCarNumber(car.driver || "Piloto", index)).padStart(2, "0").slice(-2),
      driver: car.driver || `Piloto ${index + 1}`,
      team: car.team || currentTeam,
      gridPosition: index + 1
    };
  });
}

function addTrackCar(trackCar) {
  const cars = getSavedTrackCars();
  const point = trackCarPoints[cars.length % trackCarPoints.length];
  const lapOffset = Math.min(cars.length * 370, 7200);
  const newCar = {
    id: Date.now(),
    race: "Interlagos GP",
    bestLap: formatMilliseconds(81348 + lapOffset),
    lastLap: formatMilliseconds(82005 + lapOffset),
    status: "Na pista",
    x: point.x,
    y: point.y,
    angle: point.angle,
    sector: trackCar.sector || point.sector,
    ...trackCar
  };

  saveTrackCars([...cars, newCar]);
  return newCar;
}

function createTelemetry(race, index) {
  const seed = parseLapTime(race.bestLap) / 1000 + index * 17;
  const wave = Math.sin(Date.now() / 650 + seed);
  const speed = Math.round(255 + index * 7 + wave * 18);
  const fuel = Math.max(18, Math.min(96, 78 - index * 5 + wave * 5));
  const tire = Math.max(24, Math.min(98, 86 - index * 6 - Math.abs(wave) * 8));
  const ers = Math.max(16, Math.min(100, 58 + Math.cos(Date.now() / 720 + seed) * 24));

  return {
    speed,
    fuel,
    tire,
    ers,
    carNumber: getCarNumber(race.driver, index)
  };
}


function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function updateSpeedometer(speed) {
  if (!speedValue || !speedReadout || !speedNeedle || !speedProgress) {
    return;
  }

  const roundedSpeed = Math.round(speed);
  const ratio = Math.min(speed / maxSpeed, 1);
  const angle = Math.PI - ratio * Math.PI;
  const needleLength = 68;
  const needleX = 120 + Math.cos(angle) * needleLength;
  const needleY = 125 - Math.sin(angle) * needleLength;

  speedValue.textContent = roundedSpeed;
  speedReadout.textContent = roundedSpeed;
  speedNeedle.setAttribute("x2", needleX.toFixed(2));
  speedNeedle.setAttribute("y2", needleY.toFixed(2));
  speedProgress.style.strokeDashoffset = progressLength - progressLength * ratio;
}

function animateSpeedometer() {
  if (!speedValue || !speedReadout || !speedNeedle || !speedProgress) {
    return;
  }

  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const speed = easeOutCubic(progress) * targetSpeed;

    updateSpeedometer(speed);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      updateSpeedometer(targetSpeed);
    }
  }

  requestAnimationFrame(tick);
}

function setupMenu() {
  if (!menuToggle || !mainMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainMenu.classList.toggle("is-open");

    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupReveal() {
  const revealElements = document.querySelectorAll(".apple-reveal, .reveal-card");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 70, 260)}ms`;
    observer.observe(element);
  });
}

function setupLoginPage() {
  const roleOptions = document.querySelectorAll(".role-option");
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const loginUser = document.getElementById("loginUser");
  const loginPassword = loginForm?.querySelector('input[type="password"]');
  const roleFeedback = document.getElementById("roleFeedback");

  if (!roleOptions.length || !loginForm || !loginButton || !roleFeedback) {
    return;
  }

  let selectedRole = getCurrentRole();

  function updateSelection(roleKey) {
    selectedRole = roleKey;

    roleOptions.forEach((option) => {
      option.classList.toggle("is-active", option.dataset.role === roleKey);
    });

    if (loginUser && roleCredentials[roleKey]) {
      loginUser.value = roleCredentials[roleKey].username;
    }

    if (loginPassword && roleCredentials[roleKey]) {
      loginPassword.value = roleCredentials[roleKey].password;
    }

    loginButton.textContent = roles[roleKey].loginText;
    roleFeedback.textContent = roles[roleKey].feedback;
  }

  roleOptions.forEach((option) => {
    option.addEventListener("click", () => updateSelection(option.dataset.role));
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = loginUser?.value?.trim() || roleCredentials[selectedRole].username;
    const password = loginPassword?.value || roleCredentials[selectedRole].password;

    loginButton.disabled = true;
    roleFeedback.textContent = "Validando credenciais no Race Hub...";

    try {
      const data = typeof window.loginApi === "function"
        ? await window.loginApi(username, password)
        : await callApi("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

      const authenticatedRole = data.user?.role || selectedRole;
      localStorage.setItem(storageKeys.role, authenticatedRole);
      localStorage.setItem(storageKeys.user, JSON.stringify(data.user));
      localStorage.setItem(storageKeys.token, data.token);
      roleFeedback.textContent = `${roles[authenticatedRole]?.signedIn || "Sessao iniciada."} Sincronizando banco...`;

      await syncApiData();

      roleFeedback.textContent = `${roles[authenticatedRole]?.signedIn || "Sessao iniciada."} Redirecionando para o dashboard...`;

      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 650);
    } catch (error) {
      roleFeedback.textContent = error.message || "Nao foi possivel entrar. Verifique a API em localhost:3333.";
      loginButton.disabled = false;
    }
  });

  updateSelection(selectedRole);
}

function updateDashboardPermissions() {
  const role = getRoleConfig();
  const accessChip = document.getElementById("accessChip");
  const manualAccessChip = document.getElementById("manualAccessChip");
  const teamAccessChip = document.getElementById("teamAccessChip");
  const manualRaceForm = document.getElementById("manualRaceForm");
  const raceFormMessage = document.getElementById("raceFormMessage");

  if (accessChip) {
    accessChip.textContent = role.chip;
  }

  if (manualAccessChip) {
    manualAccessChip.textContent = role.canAddRace ? "Liberado" : "Bloqueado";
  }

  if (teamAccessChip) {
    teamAccessChip.textContent = role.canEditDrivers ? "Edicao liberada" : "Consulta operacional";
  }

  if (!manualRaceForm) {
    return;
  }

  Array.from(manualRaceForm.elements).forEach((element) => {
    element.disabled = !role.canAddRace;
  });

  const teamInput = manualRaceForm.elements.teamName;

  if (role.canAddRace && teamInput) {
    teamInput.disabled = false;
    teamInput.readOnly = getCurrentRole() === "team";
    teamInput.value = getCurrentRole() === "team" ? currentTeam : teamInput.value;
  }

  if (raceFormMessage) {
    raceFormMessage.textContent = role.canAddRace
      ? "Cadastre uma corrida. Ela aparece no grid em ordem do mais rapido ao mais lento."
      : "Corredor possui acesso somente para visualizacao.";
  }
}

function updateDashboardMetrics() {
  const bestLapMetric = document.getElementById("bestLapMetric");
  const driverCountMetric = document.getElementById("driverCountMetric");
  const rankedRaces = getRankedRaces();

  if (bestLapMetric && rankedRaces[0]) {
    bestLapMetric.textContent = rankedRaces[0].bestLap;
  }

  if (driverCountMetric) {
    driverCountMetric.textContent = String(getDrivers().length);
  }
}

function renderDriverEditors() {
  const driverEditorGrid = document.getElementById("driverEditorGrid");

  if (!driverEditorGrid) {
    return;
  }

  const role = getRoleConfig();
  const drivers = getDrivers();
  const disabledAttribute = role.canEditDrivers ? "" : "disabled";

  driverEditorGrid.innerHTML = drivers.map((driver, index) => `
    <article class="driver-editor">
      <h5>Corredor ${index + 1}</h5>
      <label>
        <span>Nome</span>
        <input type="text" value="${escapeAttribute(driver.name)}" data-driver-index="${index}" data-driver-field="name" ${disabledAttribute}>
      </label>
      <label>
        <span>Carro</span>
        <input type="text" value="${escapeAttribute(driver.car)}" data-driver-index="${index}" data-driver-field="car" ${disabledAttribute}>
      </label>
      <label>
        <span>Status</span>
        <select data-driver-index="${index}" data-driver-field="status" ${disabledAttribute}>
          <option value="Titular" ${driver.status === "Titular" ? "selected" : ""}>Titular</option>
          <option value="Reserva" ${driver.status === "Reserva" ? "selected" : ""}>Reserva</option>
          <option value="Em avaliacao" ${driver.status === "Em avaliacao" ? "selected" : ""}>Em avaliacao</option>
        </select>
      </label>
    </article>
  `).join("");
}

function setupDriverEditor() {
  const driverEditorGrid = document.getElementById("driverEditorGrid");

  if (!driverEditorGrid) {
    return;
  }

  async function updateDriverData(event) {
    const field = event.target.dataset.driverField;
    const index = Number(event.target.dataset.driverIndex);

    if (!field || !getRoleConfig().canEditDrivers) {
      return;
    }

    const drivers = getDrivers();
    const driver = drivers[index];
    drivers[index][field] = event.target.value;
    saveDrivers(drivers);
    updateDashboardMetrics();

    if (event.type === "change") {
      try {
        await updateDriverOnApi(driver, field, event.target.value);
      } catch (error) {
        console.warn("Nao foi possivel atualizar piloto na API.", error);
      }
    }
  }

  driverEditorGrid.addEventListener("input", updateDriverData);
  driverEditorGrid.addEventListener("change", updateDriverData);
}

function setupManualRaceForm() {
  const manualRaceForm = document.getElementById("manualRaceForm");
  const raceFormMessage = document.getElementById("raceFormMessage");

  if (!manualRaceForm) {
    return;
  }

  setupRaceInputMasks(manualRaceForm);

  manualRaceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!getRoleConfig().canAddRace) {
      if (raceFormMessage) {
        raceFormMessage.textContent = "Este perfil nao pode adicionar corridas.";
      }
      return;
    }

    const raceNameInput = manualRaceForm.elements.raceName;
    const driverNameInput = manualRaceForm.elements.driverName;
    const teamNameInput = manualRaceForm.elements.teamName;
    const lapsInput = manualRaceForm.elements.laps;
    const bestLapInput = manualRaceForm.elements.bestLap;
    const lastLapInput = manualRaceForm.elements.lastLap;

    raceNameInput.value = titleCaseWords(sanitizeTitle(raceNameInput.value).trim());
    driverNameInput.value = titleCaseWords(sanitizeName(driverNameInput.value).trim());
    teamNameInput.value = titleCaseWords(sanitizeName(teamNameInput.value).trim());
    lapsInput.value = getDigits(lapsInput.value).slice(0, 3);
    bestLapInput.value = formatLapDigits(bestLapInput.value);
    lastLapInput.value = formatLapDigits(lastLapInput.value);

    const requiredTextFields = [raceNameInput, driverNameInput, teamNameInput];
    const emptyField = requiredTextFields.find((field) => !field.value);

    if (emptyField) {
      emptyField.focus();
      if (raceFormMessage) {
        raceFormMessage.textContent = "Preencha os nomes usando apenas letras, numeros permitidos e espacos.";
      }
      return;
    }

    if (!Number(lapsInput.value) || Number(lapsInput.value) < 1) {
      lapsInput.focus();
      if (raceFormMessage) {
        raceFormMessage.textContent = "Informe a quantidade de voltas usando apenas numeros.";
      }
      return;
    }

    if (!isCompleteLapTime(bestLapInput.value)) {
      bestLapInput.focus();
      if (raceFormMessage) {
        raceFormMessage.textContent = "Melhor volta precisa seguir o formato M:SS.mmm. Digite 121348 para 1:21.348.";
      }
      return;
    }

    if (!isCompleteLapTime(lastLapInput.value)) {
      lastLapInput.focus();
      if (raceFormMessage) {
        raceFormMessage.textContent = "Ultima volta precisa seguir o formato M:SS.mmm. Digite 122005 para 1:22.005.";
      }
      return;
    }

    const formData = new FormData(manualRaceForm);
    const raceName = formData.get("raceName").trim();
    const driverName = formData.get("driverName").trim();
    const teamName = getCurrentRole() === "team" ? currentTeam : formData.get("teamName").trim();

    const lapsCount = Number(formData.get("laps"));
    const bestLapRaw = formData.get("bestLap").trim();
    const lastLapRaw = formData.get("lastLap").trim();

    const allLapsMode = formData.get("allLapsMode") || "projected";

    const newRace = {
      id: Date.now(),
      race: raceName,
      driver: driverName,
      team: teamName,
      laps: lapsCount,
      bestLap: bestLapRaw,
      lastLap: lastLapRaw,
      track: inferTrackName(raceName),
      car: getRaceCarModel({ driver: driverName }),
      status: "Manual"
    };

    let persistedRace = null;
    let apiMessage = "";

    try {
      persistedRace = await persistRaceToApi(newRace);
    } catch (error) {
      apiMessage = ` Banco nao salvou: ${error.message}`;
    }

    if (!persistedRace) {
      const races = getRaces();
      races.push(newRace);
      saveRaces(races);
    }

    // campeonato: registra todas as voltas (MVP via geração a partir de best/last)
    if (allLapsMode === "projected") {
      upsertSeasonRoundFromManualRace(persistedRace || newRace);
    }

    updateDashboardMetrics();
    renderTrackCars();
    updateTrackMonitor();
    renderGridPage();
    renderAnalyticsPage();


    if (raceFormMessage) {
      raceFormMessage.textContent = persistedRace
        ? `Corrida adicionada no banco. Melhor volta: ${persistedRace.bestLap}.`
        : `Corrida salva localmente. Melhor volta: ${newRace.bestLap}.${apiMessage}`;
    }
  });
}

function buildSeasonFromRacesIfNeeded() {
  const season = getSeason();

  if (season.rounds?.length) {
    return;
  }

  // MVP: converte corridas legadas para 8 “rounds” por pista
  const legacyRaces = getRaces();

  const tracks = [...new Set(legacyRaces.map((r) => getRaceTrackName(r)))];
  const rounds = [];

  // garante 8 etapas
  const paddedTracks = tracks.concat(Array.from({ length: Math.max(0, 8 - tracks.length) }, (_, i) => `Pista ${i + 1}`)).slice(0, 8);

  for (let i = 0; i < 8; i += 1) {
    rounds.push({
      id: i + 1,
      index: i + 1,
      trackName: paddedTracks[i],
      status: "finished",
      recordsByDriver: {}
    });
  }

  legacyRaces.forEach((race) => {
    const trackName = getRaceTrackName(race);
    const trackIndex = paddedTracks.findIndex((t) => normalizeKey(t) === normalizeKey(trackName));

    // Se a pista nao estiver cadastrada, associa ao primeiro round disponivel.
    const roundIndex = trackIndex >= 0 ? trackIndex : 0;
    const round = rounds[roundIndex];

    const driverKey = normalizeKey(race.driver);
    if (!round.recordsByDriver[driverKey]) {
      round.recordsByDriver[driverKey] = {
        name: race.driver,
        team: race.team,
        car: race.car || getRaceCarModel(race),
        lapTimesMs: [],
        createdAt: new Date().toISOString()
      };
    }

    const bestMs = parseLapTime(race.bestLap);
    const lastMs = parseLapTime(race.lastLap);

    // Projeta a sequencia de voltas a partir da melhor e da ultima volta.
    const lapCount = Number(race.laps) || 1;
    const baseList = Number.isFinite(lastMs) ? [bestMs, lastMs] : [bestMs];

    const lapTimesMs = Array.from({ length: lapCount }, (_, idx) => baseList[idx % baseList.length]).filter((ms) => Number.isFinite(ms));
    round.recordsByDriver[driverKey].lapTimesMs.push(...lapTimesMs);
  });

  const newSeason = { ...season, rounds };
  saveSeason(newSeason);
}

function getRoundIndexFromRaceName(raceName, season) {
  const normalizedRace = normalizeKey(raceName);
  const tracks = (season?.rounds || []).map((r) => r.trackName);
  const idx = tracks.findIndex((t) => normalizedRace.includes(normalizeKey(t)));
  return idx >= 0 ? idx : 0;
}

function generateLapTimesMsFromBestLast(lapsCount, bestMs, lastMs, strategy = "projected") {
  const n = Math.max(1, Number(lapsCount) || 1);
  const best = Number.isFinite(bestMs) ? bestMs : Number.POSITIVE_INFINITY;
  const last = Number.isFinite(lastMs) ? lastMs : best;

  if (!Number.isFinite(best) && !Number.isFinite(last)) {
    return [];
  }

  // Melhor e ultima volta viram uma sequencia com pequena curvatura operacional.
  const delta = Number.isFinite(best) && Number.isFinite(last) ? (last - best) : 0;
  const scale = strategy === "aggressive" ? 1.08 : 1;

  const lapTimesMs = [];
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0 : i / (n - 1); // 0..1

    // A curva comeca perto da melhor volta e estabiliza em direcao a ultima.
    const curve = (t * t) * delta * scale;
    const wobble = Math.sin(i * 0.9 + n) * 18;

    const ms = (Number.isFinite(best) ? best : last) + curve + wobble;
    lapTimesMs.push(ms);
  }

  return lapTimesMs.filter((ms) => Number.isFinite(ms));
}

function upsertSeasonRoundFromManualRace(newRace) {
  const season = getSeason();

  if (!season.rounds?.length) {
    buildSeasonFromRacesIfNeeded();
  }

  const season2 = getSeason();
  const roundIndex = getRoundIndexFromRaceName(newRace.race, season2);
  const rounds = [...season2.rounds];
  const round = rounds[roundIndex];

  const driverKey = normalizeKey(newRace.driver);
  if (!round.recordsByDriver[driverKey]) {
    round.recordsByDriver[driverKey] = {
      name: newRace.driver,
      team: newRace.team,
      car: newRace.car || getRaceCarModel({ driver: newRace.driver }),
      lapTimesMs: [],
      createdAt: new Date().toISOString()
    };
  }

  const bestMs = parseLapTime(newRace.bestLap);
  const lastMs = parseLapTime(newRace.lastLap);

  const lapCount = Number(newRace.laps) || 1;
  const lapTimesMs = generateLapTimesMsFromBestLast(lapCount, bestMs, lastMs, "projected");
  round.recordsByDriver[driverKey].lapTimesMs = [...round.recordsByDriver[driverKey].lapTimesMs, ...lapTimesMs];

  rounds[roundIndex] = round;
  saveSeason({ ...season2, rounds });
}

function setupDashboardPage() {
  updateDashboardPermissions();
  updateDashboardMetrics();
  renderDriverEditors();
  setupDriverEditor();
  setupManualRaceForm();
  setupTrackMonitor();
}

function renderTrackCars() {
  const trackCars = document.getElementById("trackCars");

  if (!trackCars) {
    return;
  }

  const cars = getTrackCars();

  trackCars.innerHTML = cars.map((car, index) => `
    <g class="track-car ${index === activeTrackIndex ? "is-active" : ""}" tabindex="0" role="button" aria-label="Monitorar ${escapeAttribute(car.driver)}" data-track-index="${index}" transform="translate(${car.x} ${car.y}) rotate(${car.angle})">
      <rect class="track-car-body" x="-18" y="-10" width="36" height="20" rx="9"></rect>
      <circle class="track-car-wheel" cx="-10" cy="-12" r="3"></circle>
      <circle class="track-car-wheel" cx="10" cy="-12" r="3"></circle>
      <circle class="track-car-wheel" cx="-10" cy="12" r="3"></circle>
      <circle class="track-car-wheel" cx="10" cy="12" r="3"></circle>
      <text class="track-car-number" x="0" y="1" transform="rotate(${-car.angle})">${escapeHTML(car.carNumber)}</text>
    </g>
  `).join("");
}

function updateTrackMonitor() {
  const cars = getTrackCars();
  const car = cars[activeTrackIndex] || cars[0];

  if (!car) {
    return;
  }

  const telemetry = createTelemetry(car, activeTrackIndex);
  const trackDriver = document.getElementById("trackDriver");
  const trackPosition = document.getElementById("trackPosition");
  const trackSpeed = document.getElementById("trackSpeed");
  const trackTeam = document.getElementById("trackTeam");
  const trackSector = document.getElementById("trackSector");
  const trackBestLap = document.getElementById("trackBestLap");
  const trackLastLap = document.getElementById("trackLastLap");
  const trackFuelBar = document.getElementById("trackFuelBar");
  const trackTireBar = document.getElementById("trackTireBar");
  const trackErsBar = document.getElementById("trackErsBar");
  const trackNote = document.getElementById("trackNote");

  if (!trackDriver) {
    return;
  }

  trackDriver.textContent = `${car.driver} #${car.carNumber}`;
  trackPosition.textContent = `P${car.gridPosition}`;
  trackSpeed.textContent = telemetry.speed;
  trackTeam.textContent = car.team;
  trackSector.textContent = car.sector;
  trackBestLap.textContent = car.bestLap;
  trackLastLap.textContent = car.lastLap || "-";
  trackFuelBar.style.width = `${telemetry.fuel}%`;
  trackTireBar.style.width = `${telemetry.tire}%`;
  trackErsBar.style.width = `${telemetry.ers}%`;
  trackNote.textContent = `Monitorando ${car.driver} no setor ${car.sector}. Clique em outro carro para trocar.`;
}

function setupTrackMonitor() {
  const trackCars = document.getElementById("trackCars");

  if (!trackCars) {
    return;
  }

  renderTrackCars();
  updateTrackMonitor();

  trackCars.addEventListener("click", (event) => {
    const selectedCar = event.target.closest("[data-track-index]");

    if (!selectedCar) {
      return;
    }

    activeTrackIndex = Number(selectedCar.dataset.trackIndex);
    renderTrackCars();
    updateTrackMonitor();
  });

  trackCars.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const selectedCar = event.target.closest("[data-track-index]");

    if (!selectedCar) {
      return;
    }

    event.preventDefault();
    activeTrackIndex = Number(selectedCar.dataset.trackIndex);
    renderTrackCars();
    updateTrackMonitor();
  });

  if (trackMonitorTimer) {
    window.clearInterval(trackMonitorTimer);
  }

  trackMonitorTimer = window.setInterval(updateTrackMonitor, 1200);
}

function renderGridPage() {
  const gridCards = document.getElementById("gridCards");
  const racesTableBody = document.getElementById("racesTableBody");
  const raceCountChip = document.getElementById("raceCountChip");
  const rankedRaces = getGridRaces();
  const role = getRoleConfig();

  if (raceCountChip) {
    raceCountChip.textContent = formatRaceCount(rankedRaces.length);
  }

  if (gridCards) {
    gridCards.innerHTML = rankedRaces.map((race, index) => `
      <button class="grid-slot ${index === activeGridIndex ? "is-active" : ""}" type="button" data-grid-index="${index}">
        <span class="grid-position">P${index + 1}</span>
        <div>
          <strong>${escapeHTML(race.driver)} #${escapeHTML(getCarNumber(race.driver, index))}</strong>
          <span>${escapeHTML(race.bestLap)} - ${escapeHTML(race.race)}</span>
        </div>
      </button>
    `).join("");
  }

  if (!racesTableBody) {
    return;
  }

  if (!rankedRaces.length) {
    racesTableBody.innerHTML = `
      <tr>
        <td colspan="8">Nenhuma corrida registrada.</td>
      </tr>
    `;
    return;
  }

  racesTableBody.innerHTML = rankedRaces.map((race, index) => {
    const actionButton = role.canDeleteRace
      ? `<button class="table-action danger" type="button" data-delete-race="${race.id}">Excluir</button>`
      : `<button class="table-action" type="button" disabled>Protegido</button>`;

    return `
      <tr>
        <td><span class="position-badge">P${index + 1}</span></td>
        <td>${escapeHTML(race.driver)}</td>
        <td>${escapeHTML(race.team)}</td>
        <td>${escapeHTML(race.race)}</td>
        <td>${escapeHTML(race.bestLap)}</td>
        <td>${escapeHTML(race.lastLap || "-")}</td>
        <td>${escapeHTML(race.laps)}</td>
        <td>${actionButton}</td>
      </tr>
    `;
  }).join("");
}

function setupGridActions() {
  const racesTableBody = document.getElementById("racesTableBody");
  const gridCards = document.getElementById("gridCards");

  if (gridCards) {
    gridCards.addEventListener("click", (event) => {
      const selectedCard = event.target.closest("[data-grid-index]");

      if (!selectedCard) {
        return;
      }

      activeGridIndex = Number(selectedCard.dataset.gridIndex);
      gridCards.querySelectorAll(".grid-slot").forEach((card, index) => {
        card.classList.toggle("is-active", index === activeGridIndex);
      });
      updateCarMonitor();
    });
  }

  if (!racesTableBody) {
    return;
  }

  racesTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-race]");

    if (!button || !getRoleConfig().canDeleteRace) {
      return;
    }

    const raceId = Number(button.dataset.deleteRace);
    button.disabled = true;

    try {
      await deleteRaceFromApi(raceId);
    } catch (error) {
      console.warn("Nao foi possivel excluir corrida na API.", error);
      button.disabled = false;
      return;
    }

    const races = getRaces().filter((race) => race.id !== raceId);
    saveRaces(races);
    activeGridIndex = 0;
    renderGridPage();
    updateCarMonitor();
  });
}

function updateCarMonitor() {
  const races = getGridRaces();
  const race = races[activeGridIndex] || races[0];

  if (!race) {
    return;
  }

  const telemetry = createTelemetry(race, activeGridIndex);
  const monitorDriver = document.getElementById("monitorDriver");
  const monitorPosition = document.getElementById("monitorPosition");
  const monitorSpeed = document.getElementById("monitorSpeed");
  const monitorTeam = document.getElementById("monitorTeam");
  const monitorRace = document.getElementById("monitorRace");
  const monitorBestLap = document.getElementById("monitorBestLap");
  const monitorLastLap = document.getElementById("monitorLastLap");
  const monitorStatus = document.getElementById("monitorStatus");
  const monitorLaps = document.getElementById("monitorLaps");
  const monitorNote = document.getElementById("monitorNote");
  const fuelBar = document.getElementById("fuelBar");
  const tireBar = document.getElementById("tireBar");
  const ersBar = document.getElementById("ersBar");

  if (!monitorDriver) {
    return;
  }

  monitorDriver.textContent = `${race.driver} #${telemetry.carNumber}`;
  monitorPosition.textContent = `P${activeGridIndex + 1}`;
  monitorSpeed.textContent = telemetry.speed;
  monitorTeam.textContent = race.team;
  monitorRace.textContent = race.race;
  monitorBestLap.textContent = race.bestLap;
  monitorLastLap.textContent = race.lastLap || "-";
  monitorStatus.textContent = race.status || "Monitorado";
  monitorLaps.textContent = race.laps;
  monitorNote.textContent = `Monitorando ${race.driver} com telemetria de referencia. Clique em outro carro para trocar.`;
  fuelBar.style.width = `${telemetry.fuel}%`;
  tireBar.style.width = `${telemetry.tire}%`;
  ersBar.style.width = `${telemetry.ers}%`;
}

function setupGridPage() {
  if (!document.getElementById("gridCards")) {
    return;
  }

  renderGridPage();
  setupGridActions();
  updateCarMonitor();

  if (monitorTimer) {
    window.clearInterval(monitorTimer);
  }

  monitorTimer = window.setInterval(updateCarMonitor, 1200);
}

function renderKpiCards(container, cards) {
  if (!container) {
    return;
  }

  container.innerHTML = cards.map((card) => `
    <article class="kpi-card texture-panel">
      <span>${escapeHTML(card.label)}</span>
      <strong>${escapeHTML(card.value)}</strong>
      <p>${escapeHTML(card.detail)}</p>
    </article>
  `).join("");
}

function renderChartRows(container, rows, options) {
  if (!container) {
    return;
  }

  if (!rows.length) {
    container.innerHTML = '<p class="empty-state">Sem dados suficientes para gerar este grafico.</p>';
    return;
  }

  const values = rows.map(options.value).filter(Number.isFinite);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  container.innerHTML = rows.map((row, index) => {
    const value = options.value(row);
    const width = options.inverse
      ? maxValue === minValue ? 100 : 100 - ((value - minValue) / (maxValue - minValue)) * 70
      : maxValue ? (value / maxValue) * 100 : 12;
    const safeWidth = clampNumber(width, 12, 100);

    return `
      <article class="chart-row">
        <div class="chart-row-top">
          <strong>${index + 1}. ${escapeHTML(options.label(row))}</strong>
          <span>${escapeHTML(options.valueLabel(row))}</span>
        </div>
        <div class="chart-bar-track"><i style="width: ${safeWidth}%"></i></div>
        <small>${escapeHTML(options.detail(row))}</small>
      </article>
    `;
  }).join("");
}

function renderTableEmpty(tableBody, columns, message) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="${columns}">${escapeHTML(message)}</td>
    </tr>
  `;
}

function renderAnalyticsPage() {
  const analyticsPage = document.getElementById("analyticsPage");

  if (!analyticsPage) {
    return;
  }

  const races = getAnalysisRaces();
  const rankedRaces = getRankedAnalysisRaces();
  const driverStats = buildDriverStats(races);
  const trackStats = buildTrackStats(races);
  const carStats = buildCarStats(races);
  const bestDriver = driverStats[0];
  const bestRace = rankedRaces[0];
  const bestTrack = trackStats[0];
  const bestCar = carStats[0];
  const totalLaps = races.reduce((total, race) => total + (Number(race.laps) || 0), 0);
  const avgBestLap = formatMilliseconds(average(races.map((race) => parseLapTime(race.bestLap))));
  const avgConsistency = formatMilliseconds(average(driverStats.map((driver) => driver.consistencyMs)));
  const analyticsRaceCount = document.getElementById("analyticsRaceCount");

  if (analyticsRaceCount) {
    analyticsRaceCount.textContent = formatRaceCount(races.length);
  }

  renderKpiCards(document.getElementById("analyticsKpis"), [
    {
      label: "Melhor piloto",
      value: bestDriver?.name || "--",
      detail: bestDriver ? `${bestDriver.avgBestLap} de media, ${bestDriver.points} pts` : "Aguardando corridas"
    },
    {
      label: "Melhor volta",
      value: bestRace?.bestLap || "--",
      detail: bestRace ? `${bestRace.driver} em ${bestRace.race}` : "Aguardando telemetria"
    },
    {
      label: "Melhor carro",
      value: bestCar?.model || "--",
      detail: bestCar ? `Score tecnico ${bestCar.score}/100` : "Sem pacote cadastrado"
    },
    {
      label: "Pista eficiente",
      value: bestTrack?.name || "--",
      detail: bestTrack && Number.isFinite(bestTrack.secondsPerKm) ? `${bestTrack.secondsPerKm.toFixed(2)} s/km` : "Sem volta vinculada"
    },
    {
      label: "Corridas",
      value: String(races.length),
      detail: `${totalLaps} voltas registradas`
    },
    {
      label: "Media geral",
      value: avgBestLap,
      detail: `Consistencia media ${avgConsistency}`
    }
  ]);

  renderChartRows(document.getElementById("driverChart"), driverStats.slice(0, 6), {
    label: (driver) => driver.name,
    value: (driver) => driver.avgBestMs,
    valueLabel: (driver) => driver.avgBestLap,
    detail: (driver) => `${driver.races} corridas, ${driver.laps} voltas, ${driver.points} pontos`,
    inverse: true
  });

  renderChartRows(document.getElementById("trackChart"), trackStats.slice(0, 6), {
    label: (track) => track.name,
    value: (track) => track.secondsPerKm,
    valueLabel: (track) => Number.isFinite(track.secondsPerKm) ? `${track.secondsPerKm.toFixed(2)} s/km` : "--",
    detail: (track) => `${track.lengthKm} km, ${track.turns} curvas, eficiencia ${track.efficiency}/100`,
    inverse: true
  });

  renderChartRows(document.getElementById("carChart"), carStats.slice(0, 6), {
    label: (car) => car.model,
    value: (car) => car.score,
    valueLabel: (car) => `${car.score}/100`,
    detail: (car) => `${car.power} hp, aero ${car.aero}, confiabilidade ${car.reliability}`,
    inverse: false
  });

  renderChartRows(document.getElementById("lapChart"), rankedRaces.slice(0, 6), {
    label: (race) => race.driver,
    value: (race) => Number(race.laps) || 0,
    valueLabel: (race) => `${race.laps} voltas`,
    detail: (race) => `${race.race} - melhor ${race.bestLap}`,
    inverse: false
  });

  renderInsightCards(driverStats, trackStats, carStats, rankedRaces);
  renderAnalyticsTables(driverStats, trackStats, carStats, rankedRaces);
}

function renderInsightCards(driverStats, trackStats, carStats, rankedRaces) {
  const insightCards = document.getElementById("insightCards");

  if (!insightCards) {
    return;
  }

  const bestDriver = driverStats[0];
  const bestTrack = trackStats[0];
  const bestCar = carStats[0];
  const bestRace = rankedRaces[0];
  const mostConsistent = [...driverStats].sort((first, second) => first.consistencyMs - second.consistencyMs)[0];
  const longestTrack = [...trackStats].sort((first, second) => second.lengthKm - first.lengthKm)[0];

  const insights = [
    {
      title: "Piloto em destaque",
      text: bestDriver
        ? `${bestDriver.name} lidera a base com media ${bestDriver.avgBestLap} e melhor volta ${bestDriver.bestLap}.`
        : "Cadastre corridas para descobrir o piloto em destaque."
    },
    {
      title: "Volta de referencia",
      text: bestRace
        ? `${bestRace.bestLap} e o alvo atual do time, marcado por ${bestRace.driver} em ${bestRace.race}.`
        : "Nenhuma volta registrada ainda."
    },
    {
      title: "Pacote tecnico",
      text: bestCar
        ? `${bestCar.model} combina ${bestCar.power} hp, aero ${bestCar.aero} e confiabilidade ${bestCar.reliability}.`
        : "Cadastre carros para comparar os pacotes."
    },
    {
      title: "Pista chave",
      text: bestTrack
        ? `${bestTrack.name} tem indice ${bestTrack.efficiency}/100 e exige ${bestTrack.turns} curvas em ${bestTrack.lengthKm} km.`
        : "Cadastre pistas para calcular eficiencia."
    },
    {
      title: "Consistencia",
      text: mostConsistent
        ? `${mostConsistent.name} tem variacao media ${mostConsistent.consistency} entre melhor e ultima volta.`
        : "A consistencia aparece quando ha melhor e ultima volta."
    },
    {
      title: "Setup recomendado",
      text: longestTrack
        ? `${longestTrack.name} pede foco em velocidade final, ERS e estabilidade em curvas de alta.`
        : "O setup recomendado depende do cadastro de pistas."
    }
  ];

  insightCards.innerHTML = insights.map((insight) => `
    <article class="insight-card texture-panel">
      <span class="feature-icon" aria-hidden="true"></span>
      <h3>${escapeHTML(insight.title)}</h3>
      <p>${escapeHTML(insight.text)}</p>
    </article>
  `).join("");
}

function renderAnalyticsTables(driverStats, trackStats, carStats, rankedRaces) {
  const driverRankingBody = document.getElementById("driverRankingBody");
  const bestLapBody = document.getElementById("bestLapBody");
  const trackRankingBody = document.getElementById("trackRankingBody");
  const carRankingBody = document.getElementById("carRankingBody");

  if (driverRankingBody) {
    driverRankingBody.innerHTML = driverStats.length
      ? driverStats.map((driver, index) => `
        <tr>
          <td><span class="position-badge">P${index + 1}</span></td>
          <td>${escapeHTML(driver.name)}</td>
          <td>${escapeHTML(driver.teamsLabel)}</td>
          <td>${driver.races}</td>
          <td>${driver.laps}</td>
          <td>${escapeHTML(driver.bestLap)}</td>
          <td>${escapeHTML(driver.avgBestLap)}</td>
          <td>${driver.points}</td>
        </tr>
      `).join("")
      : "";

    if (!driverStats.length) {
      renderTableEmpty(driverRankingBody, 8, "Nenhum piloto ranqueado.");
    }
  }

  if (bestLapBody) {
    const bestLapMs = rankedRaces[0] ? parseLapTime(rankedRaces[0].bestLap) : Number.POSITIVE_INFINITY;

    bestLapBody.innerHTML = rankedRaces.length
      ? rankedRaces.slice(0, 12).map((race, index) => {
        const gap = parseLapTime(race.bestLap) - bestLapMs;

        return `
          <tr>
            <td><span class="position-badge">P${index + 1}</span></td>
            <td>${escapeHTML(race.driver)}</td>
            <td>${escapeHTML(race.race)}</td>
            <td>${escapeHTML(getRaceTrackName(race))}</td>
            <td>${escapeHTML(race.bestLap)}</td>
            <td>${escapeHTML(race.lastLap || "--")}</td>
            <td>${index === 0 ? "Referencia" : `+${(gap / 1000).toFixed(3)}s`}</td>
          </tr>
        `;
      }).join("")
      : "";

    if (!rankedRaces.length) {
      renderTableEmpty(bestLapBody, 7, "Nenhuma volta registrada.");
    }
  }

  if (trackRankingBody) {
    trackRankingBody.innerHTML = trackStats.length
      ? trackStats.map((track, index) => `
        <tr>
          <td><span class="position-badge">P${index + 1}</span></td>
          <td>${escapeHTML(track.name)}</td>
          <td>${escapeHTML(track.city)} / ${escapeHTML(track.country)}</td>
          <td>${track.lengthKm} km</td>
          <td>${track.turns}</td>
          <td>${escapeHTML(track.bestLap)}</td>
          <td>${Number.isFinite(track.secondsPerKm) ? `${track.secondsPerKm.toFixed(2)} s/km` : "--"}</td>
          <td>${track.efficiency}/100</td>
        </tr>
      `).join("")
      : "";

    if (!trackStats.length) {
      renderTableEmpty(trackRankingBody, 8, "Nenhuma pista cadastrada.");
    }
  }

  if (carRankingBody) {
    carRankingBody.innerHTML = carStats.length
      ? carStats.map((car, index) => `
        <tr>
          <td><span class="position-badge">P${index + 1}</span></td>
          <td>${escapeHTML(car.model)}</td>
          <td>${escapeHTML(car.driver)}</td>
          <td>${car.power} hp</td>
          <td>${car.aero}</td>
          <td>${car.reliability}</td>
          <td>${escapeHTML(car.bestLap)}</td>
          <td>${car.score}/100</td>
        </tr>
      `).join("")
      : "";

    if (!carStats.length) {
      renderTableEmpty(carRankingBody, 8, "Nenhum carro cadastrado.");
    }
  }
}

function setupAnalyticsPage() {
  if (!document.getElementById("analyticsPage")) {
    return;
  }

  renderAnalyticsPage();
}

function renderTrackSummary(trackStats) {
  const totalMetric = document.getElementById("trackTotalMetric");
  const bestMetric = document.getElementById("trackBestMetric");
  const longestMetric = document.getElementById("trackLongestMetric");
  const averageMetric = document.getElementById("trackAverageMetric");
  const strategyList = document.getElementById("trackStrategyList");
  const longestTrack = [...trackStats].sort((first, second) => second.lengthKm - first.lengthKm)[0];
  const bestTrack = trackStats[0];
  const averageLength = average(trackStats.map((track) => Number(track.lengthKm)));

  if (totalMetric) {
    totalMetric.textContent = String(trackStats.length);
  }

  if (bestMetric) {
    bestMetric.textContent = bestTrack?.name || "--";
  }

  if (longestMetric) {
    longestMetric.textContent = longestTrack ? `${longestTrack.lengthKm} km` : "--";
  }

  if (averageMetric) {
    averageMetric.textContent = Number.isFinite(averageLength) ? `${averageLength.toFixed(2)} km` : "--";
  }

  if (strategyList) {
    strategyList.innerHTML = [
      bestTrack ? `Prioridade de volta rapida: ${bestTrack.name}, eficiencia ${bestTrack.efficiency}/100.` : "Cadastre pistas para calcular prioridade.",
      longestTrack ? `Maior demanda de ERS: ${longestTrack.name}, ${longestTrack.lengthKm} km por volta.` : "Sem pista longa cadastrada.",
      "Use grip e abrasividade para comparar desgaste de pneus antes da corrida.",
      "Vincule o nome da pista ao nome da corrida para alimentar os rankings automaticamente."
    ].map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  }
}

function renderTrackList() {
  const trackList = document.getElementById("trackList");

  if (!trackList) {
    return;
  }

  const trackStats = buildTrackStats();
  renderTrackSummary(trackStats);

  if (!trackStats.length) {
    trackList.innerHTML = '<p class="empty-state">Nenhuma pista cadastrada.</p>';
    return;
  }

  trackList.innerHTML = trackStats.map((track, index) => `
    <article class="registered-track-card texture-panel">
      <div class="track-card-head">
        <span class="access-chip">${escapeHTML(track.type)}</span>
        <button class="table-action danger" type="button" data-delete-track="${track.id}">Excluir</button>
      </div>
      <svg class="mini-track-map" viewBox="0 0 180 108" aria-hidden="true">
        <path d="M140 20c26 15 29 48 10 65-20 18-47 6-67 9-23 3-39 13-58-1-22-16-17-48 7-60 19-10 40 0 60-6 17-5 30-17 48-7Z"></path>
        <circle cx="${34 + index * 14 % 108}" cy="${34 + index * 9 % 48}" r="4"></circle>
      </svg>
      <h3>${escapeHTML(track.name)}</h3>
      <p>${escapeHTML(track.city)} / ${escapeHTML(track.country)} - ${escapeHTML(track.weather)}</p>
      <div class="track-stat-grid">
        <span><b>${track.lengthKm}</b> km</span>
        <span><b>${track.turns}</b> curvas</span>
        <span><b>${track.sectors}</b> setores</span>
        <span><b>${track.grip}</b> grip</span>
        <span><b>${track.abrasion}</b> abrasao</span>
        <span><b>${track.elevation}</b> m elev.</span>
      </div>
      <div class="track-efficiency">
        <span>Indice de eficiencia</span>
        <strong>${track.efficiency}/100</strong>
      </div>
      <div class="chart-bar-track"><i style="width: ${clampNumber(track.efficiency, 8, 100)}%"></i></div>
      <p class="monitor-note">Recorde ${escapeHTML(track.record)} | melhor base ${escapeHTML(track.bestLap)} | ${track.races} corridas vinculadas.</p>
    </article>
  `).join("");
}

function setupTracksPage() {
  const tracksPage = document.getElementById("tracksPage");
  const trackForm = document.getElementById("trackForm");
  const trackList = document.getElementById("trackList");
  const trackFormMessage = document.getElementById("trackFormMessage");
  const trackAccessChip = document.getElementById("trackAccessChip");

  if (!tracksPage) {
    return;
  }

  if (trackAccessChip) {
    trackAccessChip.textContent = getRoleConfig().canManageTracks ? "Cadastro liberado" : "Consulta operacional";
  }

  renderTrackList();

  if (trackForm) {
    setupRaceInputMasks(trackForm);

    trackForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!getRoleConfig().canManageTracks) {
        if (trackFormMessage) {
          trackFormMessage.textContent = "Este perfil nao pode cadastrar pistas.";
        }
        return;
      }

      const nameInput = trackForm.elements.trackName;
      const countryInput = trackForm.elements.country;
      const cityInput = trackForm.elements.city;
      const lengthInput = trackForm.elements.lengthKm;
      const turnsInput = trackForm.elements.turns;
      const sectorsInput = trackForm.elements.sectors;
      const recordInput = trackForm.elements.record;
      const gripInput = trackForm.elements.grip;
      const elevationInput = trackForm.elements.elevation;
      const typeInput = trackForm.elements.type;
      const weatherInput = trackForm.elements.weather;
      const abrasionInput = trackForm.elements.abrasion;

      nameInput.value = titleCaseWords(sanitizeTitle(nameInput.value).trim());
      countryInput.value = titleCaseWords(sanitizeName(countryInput.value).trim());
      cityInput.value = titleCaseWords(sanitizeName(cityInput.value).trim());
      typeInput.value = titleCaseWords(sanitizeTitle(typeInput.value).trim());
      weatherInput.value = titleCaseWords(sanitizeTitle(weatherInput.value).trim());
      recordInput.value = formatLapDigits(recordInput.value);

      const requiredFields = [nameInput, countryInput, cityInput, lengthInput, turnsInput, sectorsInput, recordInput];
      const emptyField = requiredFields.find((field) => !field.value);

      if (emptyField) {
        emptyField.focus();
        if (trackFormMessage) {
          trackFormMessage.textContent = "Preencha todos os campos principais da pista.";
        }
        return;
      }

      if (!Number(lengthInput.value) || Number(lengthInput.value) <= 0) {
        lengthInput.focus();
        if (trackFormMessage) {
          trackFormMessage.textContent = "Informe a quilometragem usando numeros. Exemplo: 4.309.";
        }
        return;
      }

      if (!isCompleteLapTime(recordInput.value)) {
        recordInput.focus();
        if (trackFormMessage) {
          trackFormMessage.textContent = "Recorde precisa seguir M:SS.mmm. Digite 121348 para 1:21.348.";
        }
        return;
      }

      const newTrack = {
        id: Date.now(),
        name: nameInput.value,
        country: countryInput.value,
        city: cityInput.value,
        lengthKm: Number(lengthInput.value),
        turns: Number(getDigits(turnsInput.value)),
        sectors: Number(getDigits(sectorsInput.value)),
        record: recordInput.value,
        grip: clampNumber(getDigits(gripInput.value), 0, 100),
        elevation: Number(getDigits(elevationInput.value)),
        type: typeInput.value || "Misto",
        weather: weatherInput.value || "Variavel",
        abrasion: clampNumber(getDigits(abrasionInput.value), 0, 100)
      };
      const tracks = getTracks();
      const existingTrackIndex = tracks.findIndex((track) => normalizeKey(track.name) === normalizeKey(newTrack.name));
      const existingTrack = existingTrackIndex >= 0 ? tracks[existingTrackIndex] : null;
      let persistedTrack = null;
      let apiMessage = "";

      try {
        persistedTrack = await persistTrackToApi(newTrack, existingTrack);
      } catch (error) {
        apiMessage = ` Banco nao salvou: ${error.message}`;
      }

      if (existingTrackIndex >= 0) {
        newTrack.id = tracks[existingTrackIndex].id;
        tracks[existingTrackIndex] = persistedTrack || newTrack;
      } else {
        tracks.push(persistedTrack || newTrack);
      }

      saveTracks(tracks);
      renderTrackList();
      trackForm.reset();

      if (trackFormMessage) {
        trackFormMessage.textContent = persistedTrack
          ? `${persistedTrack.name} salva no banco e pronta para analise.`
          : `${newTrack.name} salva localmente e pronta para analise.${apiMessage}`;
      }
    });
  }

  trackList?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-track]");

    if (!button || !getRoleConfig().canManageTracks) {
      return;
    }

    const trackId = Number(button.dataset.deleteTrack);
    button.disabled = true;

    try {
      await deleteTrackFromApi(trackId);
    } catch (error) {
      console.warn("Nao foi possivel excluir pista na API.", error);
      button.disabled = false;
      if (trackFormMessage) {
        trackFormMessage.textContent = error.message || "Nao foi possivel remover a pista no banco.";
      }
      return;
    }

    const tracks = getTracks().filter((track) => track.id !== trackId);
    saveTracks(tracks);
    renderTrackList();

    if (trackFormMessage) {
      trackFormMessage.textContent = "Pista removida da biblioteca tecnica.";
    }
  });
}

function setupContactForm() {
  const demoForm = document.querySelector(".contact-form");

  if (!demoForm) {
    return;
  }

  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const button = demoForm.querySelector("button");
    const originalText = button.textContent;

    button.textContent = "Mensagem enviada";
    button.disabled = true;

    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      demoForm.reset();
    }, 2200);
  });
}

function setupShopPage() {
  const shopButtons = document.querySelectorAll(".shop-button");
  const cartList = document.getElementById("cartList");
  const cartCount = document.getElementById("cartCount");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartShipping = document.getElementById("cartShipping");
  const cartTotal = document.getElementById("cartTotal");
  const clearCartButton = document.getElementById("clearCartButton");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutButton = document.getElementById("checkoutButton");
  const checkoutMessage = document.getElementById("checkoutMessage");
  const paymentMethod = document.getElementById("paymentMethod");
  const cardFields = document.getElementById("cardFields");

  if (!shopButtons.length || !cartList || !cartCount) {
    return;
  }

  const products = Array.from(shopButtons).reduce((catalog, button) => {
    catalog[button.dataset.product] = {
      name: button.dataset.product,
      price: Number(button.dataset.price) || 0
    };

    return catalog;
  }, {});
  const legacyPrices = {
    "Camisa Team Carbon": 189.9,
    "Bone Halo Apex": 119.9,
    "Jaqueta Pit Lane": 349.9
  };

  getProducts().forEach((product) => {
    products[product.name] = Object.assign({}, products[product.name] || {}, product);
  });

  shopButtons.forEach((button) => {
    const product = products[button.dataset.product];

    if (!product) {
      return;
    }

    if (product.id) {
      button.dataset.productId = product.id;
    }

    if (product.price) {
      button.dataset.price = product.price;
      const priceLabel = button.closest(".product-card")?.querySelector(".product-row strong");

      if (priceLabel) {
        priceLabel.textContent = formatCurrency(product.price);
      }
    }
  });

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  function normalizeCartItem(item) {
    if (typeof item === "string") {
      return {
        productId: products[item]?.id,
        name: item,
        price: products[item]?.price || legacyPrices[item] || 0,
        quantity: 1
      };
    }

    return {
      productId: item.productId || products[item.name]?.id,
      name: item.name,
      price: Number(item.price) || products[item.name]?.price || legacyPrices[item.name] || 0,
      quantity: Math.max(1, Number(item.quantity) || 1)
    };
  }

  function getCart() {
    return readJSON(storageKeys.cart, [])
      .map(normalizeCartItem)
      .filter((item) => item.name);
  }

  function saveCart(cart) {
    writeJSON(storageKeys.cart, cart);
  }

  function calculateCart(cart = getCart()) {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = subtotal <= 0 ? 0 : subtotal >= 500 ? 0 : 24.9;

    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      quantity: cart.reduce((total, item) => total + item.quantity, 0)
    };
  }

  function saveOrder(order) {
    const orders = readJSON(storageKeys.orders, []);
    orders.unshift(order);
    writeJSON(storageKeys.orders, orders.slice(0, 12));
  }

  function renderCart() {
    const cart = getCart();
    const totals = calculateCart(cart);

    cartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "itens"}`;
    cartList.innerHTML = cart.length
      ? cart.map((item) => `
        <li class="cart-item">
          <div>
            <strong>${escapeHTML(item.name)}</strong>
            <span>${item.quantity} x ${formatCurrency(item.price)}</span>
          </div>
          <div class="cart-controls">
            <button type="button" aria-label="Diminuir ${escapeAttribute(item.name)}" data-cart-action="decrease" data-cart-name="${escapeAttribute(item.name)}">-</button>
            <span>${item.quantity}</span>
            <button type="button" aria-label="Aumentar ${escapeAttribute(item.name)}" data-cart-action="increase" data-cart-name="${escapeAttribute(item.name)}">+</button>
            <button type="button" class="cart-remove" data-cart-action="remove" data-cart-name="${escapeAttribute(item.name)}">Remover</button>
          </div>
        </li>
      `).join("")
      : "<li>Nenhum item adicionado.</li>";

    if (cartSubtotal) {
      cartSubtotal.textContent = formatCurrency(totals.subtotal);
    }

    if (cartShipping) {
      cartShipping.textContent = totals.shipping ? formatCurrency(totals.shipping) : "Gratis";
    }

    if (cartTotal) {
      cartTotal.textContent = formatCurrency(totals.total);
    }

    if (checkoutButton) {
      checkoutButton.disabled = !cart.length;
    }

    if (clearCartButton) {
      clearCartButton.disabled = !cart.length;
    }
  }

  shopButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const cart = getCart();
      const product = products[button.dataset.product];
      const existingItem = cart.find((item) => item.name === product.name);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      saveCart(cart);
      renderCart();
      button.textContent = "Adicionado";

      window.setTimeout(() => {
        button.textContent = "Adicionar";
      }, 1200);
    });
  });

  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.cartAction;
    const itemName = button.dataset.cartName;
    let cart = getCart();
    const item = cart.find((cartItem) => cartItem.name === itemName);

    if (!item) {
      return;
    }

    if (action === "increase") {
      item.quantity += 1;
    }

    if (action === "decrease") {
      item.quantity -= 1;
    }

    if (action === "remove" || item.quantity <= 0) {
      cart = cart.filter((cartItem) => cartItem.name !== itemName);
    }

    saveCart(cart);
    renderCart();
  });

  clearCartButton?.addEventListener("click", () => {
    saveCart([]);
    renderCart();

    if (checkoutMessage) {
      checkoutMessage.textContent = "Carrinho limpo.";
    }
  });

  function updatePaymentFields() {
    const isCard = paymentMethod?.value === "card";

    cardFields?.classList.toggle("is-hidden", !isCard);
    cardFields?.querySelectorAll("input").forEach((input) => {
      input.disabled = !isCard;
    });
  }

  function setupCheckoutMasks() {
    if (!checkoutForm) {
      return;
    }

    const customerName = checkoutForm.elements.customerName;
    const customerZip = checkoutForm.elements.customerZip;
    const cardNumber = checkoutForm.elements.cardNumber;
    const cardExpiry = checkoutForm.elements.cardExpiry;
    const cardCvv = checkoutForm.elements.cardCvv;

    customerName?.addEventListener("input", () => {
      customerName.value = sanitizeName(customerName.value);
    });

    customerName?.addEventListener("blur", () => {
      customerName.value = titleCaseWords(customerName.value.trim());
    });

    customerZip?.addEventListener("input", () => {
      const digits = getDigits(customerZip.value).slice(0, 8);
      customerZip.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    });

    cardNumber?.addEventListener("input", () => {
      cardNumber.value = getDigits(cardNumber.value)
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");
    });

    cardExpiry?.addEventListener("input", () => {
      let digits = getDigits(cardExpiry.value).slice(0, 4);

      if (digits.length >= 2) {
        const month = clampNumber(digits.slice(0, 2), 1, 12);
        digits = `${String(month).padStart(2, "0")}${digits.slice(2)}`;
      }

      cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });

    cardCvv?.addEventListener("input", () => {
      cardCvv.value = getDigits(cardCvv.value).slice(0, 3);
    });
  }

  checkoutForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cart = getCart();
    const totals = calculateCart(cart);

    if (!cart.length) {
      if (checkoutMessage) {
        checkoutMessage.textContent = "Adicione pelo menos um produto antes de finalizar.";
      }
      return;
    }

    const customerName = checkoutForm.elements.customerName;
    const customerZip = checkoutForm.elements.customerZip;
    const cardNumber = checkoutForm.elements.cardNumber;
    const cardExpiry = checkoutForm.elements.cardExpiry;
    const cardCvv = checkoutForm.elements.cardCvv;
    const selectedPayment = paymentMethod?.value || "card";

    customerName.value = titleCaseWords(sanitizeName(customerName.value).trim());

    if (getDigits(customerZip.value).length !== 8) {
      customerZip.focus();
      if (checkoutMessage) {
        checkoutMessage.textContent = "Informe um CEP com 8 numeros.";
      }
      return;
    }

    if (selectedPayment === "card") {
      if (getDigits(cardNumber.value).length !== 16) {
        cardNumber.focus();
        if (checkoutMessage) {
          checkoutMessage.textContent = "Numero do cartao precisa ter 16 digitos.";
        }
        return;
      }

      if (getDigits(cardExpiry.value).length !== 4) {
        cardExpiry.focus();
        if (checkoutMessage) {
          checkoutMessage.textContent = "Validade precisa seguir MM/AA.";
        }
        return;
      }

      if (getDigits(cardCvv.value).length !== 3) {
        cardCvv.focus();
        if (checkoutMessage) {
          checkoutMessage.textContent = "CVV precisa ter 3 numeros.";
        }
        return;
      }
    }

    const orderCode = `RA-${Date.now().toString().slice(-6)}`;
    const order = {
      code: orderCode,
      date: new Date().toISOString(),
      customer: customerName.value,
      email: checkoutForm.elements.customerEmail.value,
      zip: customerZip.value,
      payment: selectedPayment,
      items: cart,
      totals
    };

    checkoutButton.disabled = true;
    let persistedOrder = null;
    let apiMessage = isApiAuthenticated() ? "" : " Faca login para gravar no banco.";

    if (isApiAuthenticated()) {
      try {
        persistedOrder = await createOrderOnApi(order, cart, products);
        order.code = persistedOrder?.code || order.code;
        order.apiId = persistedOrder?.id;
        order.totals = persistedOrder
          ? {
              subtotal: Number(persistedOrder.subtotal) || totals.subtotal,
              shipping: Number(persistedOrder.shipping) || totals.shipping,
              total: Number(persistedOrder.total) || totals.total,
              quantity: totals.quantity
            }
          : totals;
      } catch (error) {
        apiMessage = ` Banco nao salvou: ${error.message}`;
      }
    }

    saveOrder(order);
    saveCart([]);
    renderCart();
    checkoutForm.reset();
    updatePaymentFields();

    if (checkoutMessage) {
      checkoutMessage.textContent = persistedOrder
        ? `Pedido ${order.code} registrado no banco no total de ${formatCurrency(order.totals.total)}.`
        : `Pedido ${orderCode} salvo localmente no total de ${formatCurrency(totals.total)}.${apiMessage}`;
    }
  });

  paymentMethod?.addEventListener("change", updatePaymentFields);
  setupCheckoutMasks();
  updatePaymentFields();
  renderCart();
}

window.addEventListener("resize", resizeCanvas);

async function initializeApp() {
  resizeCanvas();
  drawParticles();
  animateSpeedometer();
  setupMenu();
  setupReveal();
  setupLoginPage();

  await syncApiData();

  setupDashboardPage();
  setupGridPage();
  setupAnalyticsPage();
  setupTracksPage();
  setupContactForm();
  setupShopPage();
}

initializeApp();
