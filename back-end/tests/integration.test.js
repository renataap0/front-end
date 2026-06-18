const assert = require("assert/strict");
const { execFileSync } = require("child_process");

process.env.JWT_SECRET ||= "racing_angels_integration_test_secret_32_chars";

const { app } = require("../src/app");
const { pool } = require("../src/config/database");

const results = [];
const state = {};
let server;
let baseUrl;

function resetDatabase() {
  execFileSync(process.execPath, ["database/seed.js"], {
    cwd: process.cwd(),
    stdio: "pipe"
  });
}

async function request(path, { method = "GET", token, body, rawBody, headers = {} } = {}) {
  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: rawBody !== undefined ? rawBody : body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { data, headers: response.headers, status: response.status };
}

async function check(name, callback) {
  try {
    await callback();
    results.push({ name, passed: true });
    console.log(`PASS | ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`FAIL | ${name} | ${error.message}`);
  }
}

async function login(username, expectedRole) {
  const response = await request("/api/auth/login", {
    method: "POST",
    body: { username, password: "123456" }
  });

  assert.equal(response.status, 200);
  assert.equal(response.data.user.role, expectedRole);
  assert.equal(typeof response.data.token, "string");
  return response;
}

async function main() {
  resetDatabase();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await check("health e CORS", async () => {
      const response = await request("/health");
      assert.equal(response.status, 200);
      assert.deepEqual(response.data, { status: "ok" });
      assert.equal(response.headers.get("access-control-allow-origin"), "*");
    });

    await check("JSON malformado retorna 400", async () => {
      const response = await request("/api/auth/login", {
        method: "POST",
        rawBody: "{\"username\":",
        headers: { "Content-Type": "application/json" }
      });
      assert.equal(response.status, 400);
      assert.equal(response.data.message, "JSON invalido.");
    });

    await check("logins dos tres perfis", async () => {
      const admin = await login("admin", "admin");
      const team = await login("equipe", "team");
      const driver = await login("corredor", "driver");
      state.adminToken = admin.data.token;
      state.teamToken = team.data.token;
      state.driverToken = driver.data.token;
      state.driverUserId = driver.data.user.id;
    });

    await check("autenticacao obrigatoria e token invalido", async () => {
      assert.equal((await request("/api/teams")).status, 401);
      assert.equal((await request("/api/teams", { token: "invalido" })).status, 401);
    });

    await check("usuario autenticado nos tres perfis", async () => {
      for (const token of [state.adminToken, state.teamToken, state.driverToken]) {
        const response = await request("/api/users/me", { token });
        assert.equal(response.status, 200);
        assert.ok(response.data.id);
      }
    });

    await check("rotas de leitura principais", async () => {
      const arrayRoutes = [
        "/api/users",
        "/api/teams",
        "/api/drivers",
        "/api/cars",
        "/api/tracks",
        "/api/races",
        "/api/seasons",
        "/api/products",
        "/api/orders",
        "/api/analytics/drivers",
        "/api/analytics/tracks",
        "/api/analytics/cars"
      ];

      for (const path of arrayRoutes) {
        const response = await request(path, { token: state.adminToken });
        assert.equal(response.status, 200, path);
        assert.ok(Array.isArray(response.data), path);
      }

      for (const path of ["/api/analytics", "/api/analytics/rankings", "/api/dashboard/summary"]) {
        const response = await request(path, { token: state.adminToken });
        assert.equal(response.status, 200, path);
        assert.equal(typeof response.data, "object", path);
      }
    });

    await check("filtros de listagem", async () => {
      const teams = await request("/api/teams?name=Racing", { token: state.adminToken });
      const drivers = await request("/api/drivers?teamId=1", { token: state.adminToken });
      const cars = await request("/api/cars?teamId=1", { token: state.adminToken });
      const tracks = await request("/api/tracks?country=Brasil", { token: state.adminToken });
      const races = await request("/api/races?status=finalizada", { token: state.adminToken });

      assert.equal(teams.status, 200);
      assert.ok(teams.data.length >= 1);
      assert.ok(teams.data.every((team) => team.name.includes("Racing")));
      assert.ok(drivers.data.every((driver) => driver.teamId === 1));
      assert.ok(cars.data.every((car) => car.teamId === 1));
      assert.ok(tracks.data.every((track) => track.country === "Brasil"));
      assert.ok(races.data.every((race) => race.status === "finalizada"));
    });

    await check("permissoes basicas", async () => {
      assert.equal((await request("/api/users", { token: state.teamToken })).status, 403);
      assert.equal((await request("/api/teams", {
        method: "POST",
        token: state.driverToken,
        body: { name: "Sem permissao" }
      })).status, 403);
      assert.equal((await request("/api/races/1", {
        method: "DELETE",
        token: state.teamToken
      })).status, 403);
    });

    await check("CRUD e persistencia completa", async () => {
      let response = await request("/api/teams", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Integration Team",
          country: "Brasil",
          principal: "Chefe Teste",
          foundedYear: 2020
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.country, "Brasil");
      assert.equal(response.data.principal, "Chefe Teste");
      state.teamId = response.data.id;

      response = await request("/api/drivers", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Integration Driver",
          nationality: "Brasileira",
          status: "Titular",
          number: 77,
          teamId: state.teamId
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.number, 77);
      state.driverId = response.data.id;

      response = await request("/api/cars", {
        method: "POST",
        token: state.adminToken,
        body: {
          model: "IT-01",
          code: "IT-77",
          teamId: state.teamId,
          driverId: state.driverId,
          power: 920,
          aero: 81,
          reliability: 82,
          tireCare: 83,
          ers: 84,
          topSpeed: 330,
          weight: 799,
          packageName: "Integracao"
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.code, "IT-77");
      state.carId = response.data.id;

      response = await request("/api/tracks", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Integration Track",
          country: "Brasil",
          city: "Teste",
          lengthKm: 4.321,
          type: "mista",
          turns: 12,
          sectors: 4,
          recordLapMs: 76543,
          grip: 91,
          elevation: 123,
          weather: "Seco",
          abrasion: 67
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.turns, 12);
      assert.equal(response.data.weather, "Seco");
      state.trackId = response.data.id;

      response = await request("/api/products", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Integration Product",
          description: "Produto de teste",
          price: 88.8,
          stock: 7,
          imageUrl: "https://example.com/product.png",
          active: false
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.description, "Produto de teste");
      assert.equal(response.data.stock, 7);
      assert.equal(response.data.active, false);
      state.productId = response.data.id;

      response = await request("/api/races", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Integration GP",
          status: "treino",
          durationMs: 4530123,
          laps: 12,
          bestLapMs: 80000,
          lastLapMs: 80500,
          raceDate: "2030-05-20T12:00:00.000Z",
          teamId: state.teamId,
          driverId: state.driverId,
          trackId: state.trackId,
          carId: state.carId
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.raceDate, "2030-05-20T12:00:00.000Z");
      assert.equal(response.data.durationMs, 4530123);
      state.raceId = response.data.id;
    });

    await check("rotas de detalhe e atualizacao", async () => {
      const detailRoutes = [
        [`/api/drivers/${state.driverId}`, state.driverId],
        [`/api/cars/${state.carId}`, state.carId],
        [`/api/tracks/${state.trackId}`, state.trackId],
        [`/api/races/${state.raceId}`, state.raceId],
        [`/api/products/${state.productId}`, state.productId]
      ];

      for (const [path, id] of detailRoutes) {
        const response = await request(path, { token: state.adminToken });
        assert.equal(response.status, 200, path);
        assert.equal(response.data.id, id, path);
      }

      let response = await request(`/api/teams/${state.teamId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { name: "Integration Team Updated", principal: "Chefe Atualizado" }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.name, "Integration Team Updated");

      response = await request(`/api/drivers/${state.driverId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { name: "Integration Driver Updated", status: "Reserva", number: 78 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.status, "Reserva");
      assert.equal(response.data.number, 78);

      response = await request(`/api/cars/${state.carId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { model: "IT-02", code: "IT-78", power: 925 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.code, "IT-78");
      assert.equal(response.data.power, 925);

      response = await request(`/api/tracks/${state.trackId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { city: "Cidade Atualizada", turns: 13 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.city, "Cidade Atualizada");
      assert.equal(response.data.turns, 13);

      response = await request(`/api/products/${state.productId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { name: "Integration Product Updated", price: 99.9, active: true }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.price, 99.9);
      assert.equal(response.data.active, true);

      response = await request(`/api/races/${state.raceId}`, {
        method: "PUT",
        token: state.adminToken,
        body: { status: "finalizada", laps: 13 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.status, "finalizada");
      assert.equal(response.data.laps, 13);
    });

    await check("permissoes operacionais da equipe", async () => {
      let response = await request("/api/drivers/1", {
        method: "PUT",
        token: state.teamToken,
        body: { name: "Raphael Galhardo", status: "Titular", teamId: 999 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.teamId, 1);

      const carBefore = await request("/api/cars/1", { token: state.teamToken });
      response = await request("/api/cars/1", {
        method: "PUT",
        token: state.teamToken,
        body: { model: carBefore.data.model, power: 1 }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.power, carBefore.data.power);

      response = await request("/api/races/1", {
        method: "PUT",
        token: state.teamToken,
        body: { status: "finalizada" }
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.teamId, 1);

      response = await request("/api/tracks", {
        method: "POST",
        token: state.teamToken,
        body: {
          name: "Team Temporary Track",
          country: "Brasil",
          city: "Equipe",
          lengthKm: 3.5,
          type: "tecnica"
        }
      });
      assert.equal(response.status, 201);
      assert.equal((await request(`/api/tracks/${response.data.id}`, {
        method: "DELETE",
        token: state.teamToken
      })).status, 204);
    });

    await check("rotas de exclusao com registros descartaveis", async () => {
      let response = await request("/api/teams", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Disposable Team" }
      });
      const teamId = response.data.id;

      response = await request("/api/drivers", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Disposable Driver", status: "Titular", teamId }
      });
      const driverId = response.data.id;

      response = await request("/api/cars", {
        method: "POST",
        token: state.adminToken,
        body: {
          model: "Disposable Car",
          teamId,
          driverId,
          power: 900,
          aero: 80,
          reliability: 80,
          tireCare: 80,
          ers: 80,
          topSpeed: 320,
          weight: 800
        }
      });
      const carId = response.data.id;

      response = await request("/api/tracks", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Disposable Track",
          country: "Brasil",
          city: "Teste",
          lengthKm: 3.1,
          type: "mista"
        }
      });
      const trackId = response.data.id;

      response = await request("/api/races", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Disposable GP",
          status: "treino",
          laps: 1,
          bestLapMs: 80000,
          lastLapMs: 81000,
          teamId,
          driverId,
          trackId,
          carId
        }
      });
      const raceId = response.data.id;

      response = await request("/api/products", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Disposable Product", price: 10, stock: 1 }
      });
      const productId = response.data.id;

      assert.equal((await request(`/api/races/${raceId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
      assert.equal((await request(`/api/cars/${carId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
      assert.equal((await request(`/api/drivers/${driverId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
      assert.equal((await request(`/api/tracks/${trackId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
      assert.equal((await request(`/api/products/${productId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
      assert.equal((await request(`/api/teams/${teamId}`, {
        method: "DELETE",
        token: state.adminToken
      })).status, 204);
    });

    await check("temporada, etapa e voltas", async () => {
      let response = await request("/api/seasons", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Integration Season", year: 2030, status: "Planejada" }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.name, "Integration Season");
      assert.equal(response.data.year, 2030);
      state.seasonId = response.data.id;

      response = await request(`/api/seasons/${state.seasonId}`, {
        token: state.adminToken
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.id, state.seasonId);

      response = await request(`/api/seasons/${state.seasonId}/rounds`, {
        method: "POST",
        token: state.adminToken,
        body: {
          raceId: state.raceId,
          trackId: state.trackId,
          name: "Integration Round",
          roundNumber: 1,
          scheduledAt: "2030-05-20T12:00:00.000Z"
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.raceId, state.raceId);
      assert.equal(response.data.scheduledAt, "2030-05-20T12:00:00.000Z");
      state.roundId = response.data.id;

      response = await request(`/api/season-rounds/${state.roundId}/laps`, {
        method: "POST",
        token: state.adminToken,
        body: {
          driverId: state.driverId,
          carId: state.carId,
          lapNumber: 1,
          lapTimeMs: 80123
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.carId, state.carId);

      response = await request(`/api/season-rounds/${state.roundId}/laps/bulk`, {
        method: "POST",
        token: state.adminToken,
        body: {
          laps: [
            { driverId: state.driverId, carId: state.carId, lapNumber: 2, lapTimeMs: 80234 },
            { driverId: 1, carId: 1, lapNumber: 1, lapTimeMs: 80345 }
          ]
        }
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.length, 2);

      response = await request(`/api/season-rounds/${state.roundId}/laps`, {
        token: state.adminToken
      });
      assert.equal(response.status, 200);
      assert.equal(response.data.length, 3);
    });

    await check("pedido persiste cliente, total e decrementa estoque", async () => {
      const before = await request("/api/products/1", { token: state.driverToken });
      const response = await request("/api/orders", {
        method: "POST",
        token: state.driverToken,
        body: {
          customerName: "Cliente Integracao",
          customerEmail: "cliente@example.com",
          customerZip: "01001-000",
          paymentMethod: "pix",
          items: [{ productId: 1, quantity: 1 }]
        }
      });
      const after = await request("/api/products/1", { token: state.driverToken });

      assert.equal(response.status, 201);
      assert.equal(response.data.customerName, "Cliente Integracao");
      assert.equal(response.data.customerEmail, "cliente@example.com");
      assert.equal(response.data.customerZip, "01001-000");
      assert.equal(response.data.paymentMethod, "pix");
      assert.equal(response.data.subtotal, 149.9);
      assert.equal(response.data.shipping, 24.9);
      assert.equal(response.data.total, 174.8);
      assert.equal(after.data.stock, before.data.stock - 1);
      state.orderId = response.data.id;
    });

    await check("isolamento de pedidos", async () => {
      assert.equal((await request(`/api/orders/${state.orderId}`, {
        token: state.driverToken
      })).status, 200);
      assert.equal((await request(`/api/orders/${state.orderId}`, {
        token: state.teamToken
      })).status, 404);
      assert.equal((await request(`/api/orders/${state.orderId}`, {
        token: state.adminToken
      })).status, 200);
    });

    await check("estoque insuficiente e rollback", async () => {
      const before = await request("/api/products/4", { token: state.driverToken });
      const response = await request("/api/orders", {
        method: "POST",
        token: state.driverToken,
        body: {
          customerName: "Sem estoque",
          customerEmail: "estoque@example.com",
          customerZip: "01001000",
          paymentMethod: "card",
          items: [{ productId: 4, quantity: 999999 }]
        }
      });
      const after = await request("/api/products/4", { token: state.driverToken });

      assert.equal(response.status, 409);
      assert.equal(after.data.stock, before.data.stock);
    });

    await check("validacoes e conflitos", async () => {
      assert.equal((await request("/api/drivers", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Status invalido", status: "voando", teamId: 1 }
      })).status, 400);

      assert.equal((await request("/api/orders", {
        method: "POST",
        token: state.driverToken,
        body: {
          customerName: "CEP invalido",
          customerEmail: "cep@example.com",
          customerZip: "1",
          paymentMethod: "pix",
          items: [{ productId: 1, quantity: 1 }]
        }
      })).status, 400);

      assert.equal((await request("/api/teams", {
        method: "POST",
        token: state.adminToken,
        body: { name: "Racing Angels" }
      })).status, 409);

      assert.equal((await request("/api/races", {
        method: "POST",
        token: state.adminToken,
        body: {
          name: "Carro incorreto",
          status: "treino",
          laps: 1,
          bestLapMs: 80000,
          lastLapMs: 81000,
          teamId: 1,
          driverId: 1,
          trackId: 1,
          carId: 2
        }
      })).status, 400);
    });

    await check("rota inexistente e ids inexistentes", async () => {
      assert.equal((await request("/api/nao-existe", { token: state.adminToken })).status, 404);

      for (const path of [
        "/api/drivers/999999",
        "/api/cars/999999",
        "/api/tracks/999999",
        "/api/races/999999",
        "/api/seasons/999999",
        "/api/products/999999",
        "/api/orders/999999"
      ]) {
        assert.equal((await request(path, { token: state.adminToken })).status, 404, path);
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
    resetDatabase();
  }

  const failed = results.filter((result) => !result.passed);
  console.log(`SUMMARY | total=${results.length} passed=${results.length - failed.length} failed=${failed.length}`);

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
