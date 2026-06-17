window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

window.getToken = function() {
  return localStorage.getItem("racingAngelsToken");
};

window.apiFetch = async function(path, options = {}) {
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const token = window.getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${window.API_BASE_URL}${path}`, Object.assign({}, options, { headers }));

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error((data && data.message) || "Erro ao chamar API");
    error.status = response.status;
    throw error;
  }

  return data;
};

window.loginApi = async function(username, password) {
  const data = await window.apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  localStorage.setItem("racingAngelsToken", data.token);
  localStorage.setItem("racingAngelsUser", JSON.stringify(data.user));
  localStorage.setItem("racingAngelsRole", data.user?.role || "driver");

  return data;
};

window.buildQueryString = function(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

window.getTeamsApi = (filters = {}) => window.apiFetch(`/teams${window.buildQueryString(filters)}`);
window.getDriversApi = (filters = {}) => window.apiFetch(`/drivers${window.buildQueryString(filters)}`);
window.getCarsApi = (filters = {}) => window.apiFetch(`/cars${window.buildQueryString(filters)}`);
window.getTracksApi = (filters = {}) => window.apiFetch(`/tracks${window.buildQueryString(filters)}`);
window.getRacesApi = (filters = {}) => window.apiFetch(`/races${window.buildQueryString(filters)}`);
window.getProductsApi = (filters = {}) => window.apiFetch(`/products${window.buildQueryString(filters)}`);
window.getDashboardApi = () => window.apiFetch("/dashboard/summary");
window.getAnalyticsApi = () => window.apiFetch("/analytics");
window.getSeasonsApi = () => window.apiFetch("/seasons");
window.getSeasonRoundLapsApi = (id) => window.apiFetch(`/season-rounds/${id}/laps`);

window.updateDriverApi = (id, payload) => window.apiFetch(`/drivers/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload)
});

window.updateCarApi = (id, payload) => window.apiFetch(`/cars/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload)
});

window.createTrackApi = (payload) => window.apiFetch("/tracks", {
  method: "POST",
  body: JSON.stringify(payload)
});

window.updateTrackApi = (id, payload) => window.apiFetch(`/tracks/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload)
});

window.deleteTrackApi = (id) => window.apiFetch(`/tracks/${id}`, {
  method: "DELETE"
});

window.createRaceApi = (payload) => window.apiFetch("/races", {
  method: "POST",
  body: JSON.stringify(payload)
});

window.deleteRaceApi = (id) => window.apiFetch(`/races/${id}`, {
  method: "DELETE"
});

window.createOrderApi = (payload) => window.apiFetch("/orders", {
  method: "POST",
  body: JSON.stringify(payload)
});

window.createSeasonApi = (payload) => window.apiFetch("/seasons", {
  method: "POST",
  body: JSON.stringify(payload)
});

window.createSeasonRoundApi = (seasonId, payload) => window.apiFetch(`/seasons/${seasonId}/rounds`, {
  method: "POST",
  body: JSON.stringify(payload)
});

window.createSeasonRoundLapsApi = (roundId, laps) => window.apiFetch(`/season-rounds/${roundId}/laps/bulk`, {
  method: "POST",
  body: JSON.stringify({ laps })
});
