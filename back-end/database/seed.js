const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseUrl = process.env.DATABASE_URL || "mysql://root:root@localhost:3306/racing_angels";

function parseConnection(database = true) {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, "") || "racing_angels";

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error("DATABASE_URL precisa usar um nome de banco simples com letras, numeros ou underscore.");
  }

  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username || "root"),
    password: decodeURIComponent(url.password || ""),
    database: database ? databaseName : undefined,
    multipleStatements: true,
    decimalNumbers: true
  };
}

async function insert(connection, sql, params) {
  const [result] = await connection.execute(sql, params);
  return result.insertId;
}

async function main() {
  const databaseName = parseConnection(false).database || new URL(databaseUrl).pathname.replace(/^\//, "");
  const adminConnection = await mysql.createConnection(parseConnection(false));
  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await adminConnection.end();

  const connection = await mysql.createConnection(parseConnection(true));
  const schema = fs.readFileSync(path.resolve(__dirname, "schema.sql"), "utf8");
  await connection.query(schema);

  const passwordHash = await bcrypt.hash("123456", 10);

  const racingAngels = await insert(connection, "INSERT INTO teams (name, country, principal, founded_year) VALUES (?, ?, ?, ?)", ["Racing Angels", "Brasil", "Renata Alves", 2024]);
  const sakuraRacing = await insert(connection, "INSERT INTO teams (name, country, principal, founded_year) VALUES (?, ?, ?, ?)", ["Sakura Racing", "Japao", "Haru Sato", 2023]);
  const apexStorms = await insert(connection, "INSERT INTO teams (name, country, principal, founded_year) VALUES (?, ?, ?, ?)", ["Apex Storms", "Portugal", "Marta Silva", 2022]);
  const apexRacing = await insert(connection, "INSERT INTO teams (name, country, principal, founded_year) VALUES (?, ?, ?, ?)", ["Apex Racing", "Italia", "Marco Guidoni", 2021]);

  const raphael = await insert(connection, "INSERT INTO drivers (name, nationality, status, number, team_id) VALUES (?, ?, ?, ?, ?)", ["Raphael Galhardo", "Brasil", "Titular", 7, racingAngels]);
  const renata = await insert(connection, "INSERT INTO drivers (name, nationality, status, number, team_id) VALUES (?, ?, ?, ?, ?)", ["Renata Queiroz", "Brasil", "Titular", 11, sakuraRacing]);
  const rafaela = await insert(connection, "INSERT INTO drivers (name, nationality, status, number, team_id) VALUES (?, ?, ?, ?, ?)", ["Rafaela Santana", "Brasil", "Reserva", 21, apexStorms]);
  const luca = await insert(connection, "INSERT INTO drivers (name, nationality, status, number, team_id) VALUES (?, ?, ?, ?, ?)", ["Luca Guidoni", "Italia", "Titular", 34, apexRacing]);

  await connection.execute(
    "INSERT INTO users (username, password, role, team_id, driver_id) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
    [
      "admin", passwordHash, "admin", null, null,
      "equipe", passwordHash, "team", racingAngels, null,
      "corredor", passwordHash, "driver", racingAngels, raphael
    ]
  );

  const ra07 = await insert(connection, "INSERT INTO cars (model, code, team_id, driver_id, power, aero, reliability, tire_care, ers, top_speed, weight, package_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["RA-07 Halo", "RA-07", racingAngels, raphael, 1018, 92, 94, 86, 88, 334, 796, "Aero balanceado"]);
  const ra11 = await insert(connection, "INSERT INTO cars (model, code, team_id, driver_id, power, aero, reliability, tire_care, ers, top_speed, weight, package_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["RA-11 Sprint", "RA-11", sakuraRacing, renata, 1006, 88, 91, 90, 84, 329, 798, "Tracao e pneus"]);
  const rax = await insert(connection, "INSERT INTO cars (model, code, team_id, driver_id, power, aero, reliability, tire_care, ers, top_speed, weight, package_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["RA-X Reserve", "RA-X", apexStorms, rafaela, 998, 86, 96, 84, 82, 326, 801, "Confiabilidade"]);
  const oa01 = await insert(connection, "INSERT INTO cars (model, code, team_id, driver_id, power, aero, reliability, tire_care, ers, top_speed, weight, package_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["OA-01 Apex", "OA-01", apexRacing, luca, 1002, 87, 89, 82, 83, 328, 800, "Reta longa"]);

  const tracks = {};
  const trackRows = [
    ["Interlagos", "Brasil", "Sao Paulo", 4.309, 15, 3, 70540, 86, 43, "Misto", "Instavel", 72],
    ["Monaco", "Monaco", "Monte Carlo", 3.337, 19, 3, 72908, 78, 42, "Rua", "Seco", 48],
    ["Spa", "Belgica", "Stavelot", 7.004, 19, 3, 104210, 83, 102, "Alta velocidade", "Instavel", 67],
    ["Suzuka", "Japao", "Suzuka", 5.807, 18, 3, 89771, 84, 40, "Tecnico", "Umido", 62],
    ["Silverstone", "Reino Unido", "Towcester", 5.891, 18, 3, 87097, 88, 11, "Rapido", "Frio", 58]
  ];

  for (const track of trackRows) {
    tracks[track[0]] = await insert(
      connection,
      "INSERT INTO tracks (name, country, city, length_km, turns, sectors, record_lap_ms, grip, elevation, type, weather, abrasion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      track
    );
  }

  const interlagosGp = await insert(connection, "INSERT INTO races (name, status, laps, best_lap_ms, last_lap_ms, race_date, team_id, driver_id, track_id, car_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["Interlagos GP", "Finalizada", 42, 81348, 82005, "2026-03-10 18:00:00", racingAngels, raphael, tracks.Interlagos, ra07]);
  const monacoRun = await insert(connection, "INSERT INTO races (name, status, laps, best_lap_ms, last_lap_ms, race_date, team_id, driver_id, track_id, car_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["Monaco Night Run", "Finalizada", 39, 72908, 73210, "2026-04-05 20:00:00", sakuraRacing, renata, tracks.Monaco, ra11]);
  const spaTest = await insert(connection, "INSERT INTO races (name, status, laps, best_lap_ms, last_lap_ms, race_date, team_id, driver_id, track_id, car_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["Spa Aero Test", "Treino", 31, 104210, 105010, "2026-05-12 15:00:00", apexStorms, rafaela, tracks.Spa, rax]);
  const suzukaCup = await insert(connection, "INSERT INTO races (name, status, laps, best_lap_ms, last_lap_ms, race_date, team_id, driver_id, track_id, car_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ["Suzuka Data Cup", "Finalizada", 36, 89771, 90402, "2026-06-02 10:00:00", apexRacing, luca, tracks.Suzuka, oa01]);

  const season = await insert(connection, "INSERT INTO seasons (name, year, status) VALUES (?, ?, ?)", ["CorridaPro Series", 2026, "Ativa"]);
  const races = [
    [interlagosGp, tracks.Interlagos, "Interlagos GP", "2026-03-10 18:00:00", raphael, ra07, 81348, 82005],
    [monacoRun, tracks.Monaco, "Monaco Night Run", "2026-04-05 20:00:00", renata, ra11, 72908, 73210],
    [spaTest, tracks.Spa, "Spa Aero Test", "2026-05-12 15:00:00", rafaela, rax, 104210, 105010],
    [suzukaCup, tracks.Suzuka, "Suzuka Data Cup", "2026-06-02 10:00:00", luca, oa01, 89771, 90402]
  ];

  for (let index = 0; index < races.length; index += 1) {
    const [raceId, trackId, name, scheduledAt, driverId, carId, bestLapMs, lastLapMs] = races[index];
    const round = await insert(connection, "INSERT INTO season_rounds (season_id, race_id, track_id, name, round_number, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)", [season, raceId, trackId, name, index + 1, scheduledAt]);

    await connection.execute(
      "INSERT INTO season_round_laps (season_round_id, driver_id, car_id, lap_number, lap_time_ms) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
      [
        round, driverId, carId, 1, bestLapMs + 920,
        round, driverId, carId, 2, bestLapMs,
        round, driverId, carId, 3, lastLapMs
      ]
    );
  }

  await connection.execute(
    "INSERT INTO products (name, description, price, stock, image_url, active) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)",
    [
      "Camisa Team Carbon", "Camisa oficial preta com detalhes dourados Racing Angels.", 189.9, 50, "assets/shop/image (2).png", 1,
      "Bone Halo Apex", "Bone de paddock com aba curva e logo bordado.", 119.9, 40, "assets/shop/image (3).png", 1,
      "Jaqueta Pit Lane", "Jaqueta leve para viagem e area tecnica.", 349.9, 24, "assets/shop/image (4).png", 1,
      "Miniatura RA-07 Halo", "Modelo colecionavel do carro RA-07.", 259.9, 30, "assets/shop/image (5).png", 1
    ]
  );

  await connection.end();
  console.log("Banco Racing Angels criado e populado com sucesso.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
