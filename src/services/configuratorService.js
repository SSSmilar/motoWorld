const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data;
}

export async function fetchProducts() {
  return request('/api/products');
}

export async function fetchProductById(id) {
  return request(`/api/products/${id}`);
}

export async function fetchStockParts(vehicleId) {
  return request(`/api/vehicles/${vehicleId}/parts`);
}

export async function fetchCompatibleTuning(vehicleId) {
  return request(`/api/vehicles/${vehicleId}/compatible-parts`);
}

export async function validateConfig(vehicleId, selectedPartIds) {
  return request('/api/validate-config', {
    method: 'POST',
    body: JSON.stringify({ vehicle_id: vehicleId, selected_part_ids: selectedPartIds }),
  });
}

export async function createOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders(userId) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return request(`/api/orders${query}`);
}

export function formatPrice(rub) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(rub);
}
