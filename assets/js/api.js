// Front-end global API helper (non-module) to integrate with backend API
window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3333/api";

window.getToken = function() {
  return localStorage.getItem("racingAngelsToken");
};

window.apiFetch = async function(path, options = {}) {
  const token = window.getToken();
  const headers = Object.assign({
    "Content-Type": "application/json"
  }, options.headers || {});

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${window.API_BASE_URL}${path}`, Object.assign({}, options, { headers }));

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data && data.message) || "Erro ao chamar API");
  }

  return data;
};

window.loginApi = async function(username, password) {
  const data = await window.apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  localStorage.setItem('racingAngelsToken', data.token);
  localStorage.setItem('racingAngelsUser', JSON.stringify(data.user));
  return data;
};

window.getRacesApi = function(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return window.apiFetch(`/races${query ? `?${query}` : ''}`);
};

window.createOrderApi = function(payload) {
  return window.apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
};
