const rawBase = import.meta.env.VITE_API_URL || '/api';
const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
export const BASE_URL = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

function getToken() {
  return localStorage.getItem('trustchain_token');
}

function setToken(token) {
  localStorage.setItem('trustchain_token', token);
}

function clearToken() {
  localStorage.removeItem('trustchain_token');
}

function getCurrentUser() {
  const raw = localStorage.getItem('trustchain_user');
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('trustchain_user', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('trustchain_user');
}

export async function fetchApi(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function checkServerHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
    return { online: false, status: res.status };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function login(actor_id, password) {
  const data = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ actor_id, password })
  });

  setToken(data.token);
  setCurrentUser(data.actor);
  return data;
}

export async function getProfile() {
  return fetchApi('/auth/me');
}

export function logout() {
  clearToken();
  clearCurrentUser();
}

export { getToken, getCurrentUser };

export async function registerProduct(productData) {
  return fetchApi('/products/register', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

export async function fetchChain(productId) {
  return fetchApi(`/products/${productId}/chain`);
}

export async function transferCustody(transferData) {
  return fetchApi('/products/transfer', {
    method: 'POST',
    body: JSON.stringify(transferData)
  });
}

export async function verifyProduct(verificationData) {
  return fetchApi('/products/verify', {
    method: 'POST',
    body: JSON.stringify(verificationData)
  });
}

export async function simulateCounterfeit(product_id) {
  return fetchApi('/demo/simulate-counterfeit', {
    method: 'POST',
    body: JSON.stringify({ product_id })
  });
}

export async function fetchAlerts() {
  return fetchApi('/alerts');
}

export async function seedDatabase() {
  return fetchApi('/db/seed', { method: 'POST' });
}
