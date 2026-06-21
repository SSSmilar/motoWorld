import { readLocalStorage, updateLocalStorage } from '../utils/localStorage';
import { fetchProducts } from './configuratorService';

export const STORAGE_KEYS = {
  motorcycles: 'motorcycles',
  parts: 'parts',
  orders: 'orders',
};

const ORDER_STATUSES = ['Новый', 'В обработке', 'Завершен'];

export { ORDER_STATUSES };

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function parseEngineSpecs(engine = '') {
  const volumeMatch = engine.match(/(\d[\d\s]*)\s*см³/i);
  const powerMatch = engine.match(/(\d+)\s*л\.?\s*с\.?/i);
  return {
    volume: volumeMatch ? `${volumeMatch[1].replace(/\s/g, '')} см³` : '',
    power: powerMatch ? `${powerMatch[1]} л.с.` : '',
    year: new Date().getFullYear(),
  };
}

function mapVehicleToMotorcycle(vehicle) {
  return {
    id: vehicle.id,
    name: vehicle.name,
    description: vehicle.description ?? '',
    price: vehicle.price ?? 0,
    category: vehicle.category ?? 'Дорожный',
    specs: parseEngineSpecs(vehicle.engine),
    stockPartIds: [],
    image: vehicle.image ?? '',
    stock: vehicle.stock ?? 3,
  };
}

function mapPartToAdminPart(part) {
  return {
    id: part.id,
    name: part.name,
    description: part.description ?? '',
    price: part.price ?? 0,
    article: part.article ?? `P-${part.id}`,
    brand: part.brand ?? '',
    material: part.material ?? '',
    compatible_with: part.compatible_with ?? [],
    category: part.category ?? '',
  };
}

function mapOrderToStorage(order) {
  return {
    id: order.id,
    customer_name: order.customer_name,
    phone: order.phone,
    user_id: order.user_id ?? null,
    items: order.items ?? [],
    total_price: order.total_price ?? 0,
    status: ORDER_STATUSES.includes(order.status) ? order.status : 'Новый',
    created_at: order.created_at ?? new Date().toISOString(),
  };
}

/** Инициализация localStorage из API, если ключи пусты */
export async function initAdminStorage() {
  const motorcycles = readLocalStorage(STORAGE_KEYS.motorcycles);
  const parts = readLocalStorage(STORAGE_KEYS.parts);
  const orders = readLocalStorage(STORAGE_KEYS.orders);

  if (motorcycles.length && parts.length && orders.length) return;

  try {
    const products = await fetchProducts();

    if (!motorcycles.length) {
      const seeded = products
        .filter((p) => p.type === 'vehicle')
        .map(mapVehicleToMotorcycle);
      if (seeded.length) updateLocalStorage(STORAGE_KEYS.motorcycles, seeded);
    }

    if (!parts.length) {
      const seeded = products
        .filter((p) => p.type === 'part')
        .map(mapPartToAdminPart);
      if (seeded.length) updateLocalStorage(STORAGE_KEYS.parts, seeded);
    }

    if (!orders.length) {
      const { fetchOrders } = await import('./configuratorService');
      const apiOrders = await fetchOrders();
      const seeded = apiOrders.map(mapOrderToStorage);
      if (seeded.length) updateLocalStorage(STORAGE_KEYS.orders, seeded);
    }
  } catch {
    if (!motorcycles.length) updateLocalStorage(STORAGE_KEYS.motorcycles, []);
    if (!parts.length) updateLocalStorage(STORAGE_KEYS.parts, []);
    if (!orders.length) updateLocalStorage(STORAGE_KEYS.orders, []);
  }
}

// ——— Заказы ———

export function getOrders() {
  return readLocalStorage(STORAGE_KEYS.orders);
}

export function saveOrders(orders) {
  return updateLocalStorage(STORAGE_KEYS.orders, orders);
}

export function addOrder(order) {
  const orders = getOrders();
  const stored = mapOrderToStorage(order);
  const updated = [...orders, stored];
  saveOrders(updated);
  return stored;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, status } : o
  );
  saveOrders(updated);
  return updated;
}

export function deleteOrder(orderId) {
  const updated = getOrders().filter((o) => o.id !== orderId);
  saveOrders(updated);
  return updated;
}

// ——— Мотоциклы ———

export function getMotorcycles() {
  return readLocalStorage(STORAGE_KEYS.motorcycles);
}

export function saveMotorcycles(motorcycles) {
  return updateLocalStorage(STORAGE_KEYS.motorcycles, motorcycles);
}

export function addMotorcycle(data) {
  const motorcycles = getMotorcycles();
  const motorcycle = {
    id: nextId(motorcycles),
    name: data.name,
    description: data.description ?? '',
    price: Number(data.price) || 0,
    category: data.category,
    specs: {
      volume: data.specs?.volume ?? data.volume ?? '',
      power: data.specs?.power ?? data.power ?? '',
      year: Number(data.specs?.year ?? data.year) || new Date().getFullYear(),
    },
    stockPartIds: data.stockPartIds ?? [],
    image: data.image ?? '',
    stock: Number(data.stock) || 3,
  };
  const updated = [...motorcycles, motorcycle];
  saveMotorcycles(updated);
  return motorcycle;
}

export function updateMotorcycle(id, data) {
  const motorcycles = getMotorcycles();
  const updated = motorcycles.map((m) =>
    m.id === id
      ? {
          ...m,
          name: data.name ?? m.name,
          description: data.description ?? m.description,
          price: Number(data.price ?? m.price),
          category: data.category ?? m.category,
          specs: {
            volume: data.specs?.volume ?? data.volume ?? m.specs?.volume ?? '',
            power: data.specs?.power ?? data.power ?? m.specs?.power ?? '',
            year: Number(data.specs?.year ?? data.year ?? m.specs?.year) || m.specs?.year,
          },
          stockPartIds: data.stockPartIds ?? m.stockPartIds ?? [],
          image: data.image ?? m.image ?? '',
          stock: Number(data.stock ?? m.stock) || m.stock,
        }
      : m
  );
  saveMotorcycles(updated);
  return updated;
}

export function deleteMotorcycle(id) {
  const updated = getMotorcycles().filter((m) => m.id !== id);
  saveMotorcycles(updated);
  return updated;
}

// ——— Запчасти ———

export function getParts() {
  return readLocalStorage(STORAGE_KEYS.parts);
}

export function saveParts(parts) {
  return updateLocalStorage(STORAGE_KEYS.parts, parts);
}

export function addPart(data) {
  const parts = getParts();
  const part = {
    id: nextId(parts),
    name: data.name,
    description: data.description ?? '',
    price: Number(data.price) || 0,
    article: data.article ?? '',
    brand: data.brand ?? '',
    material: data.material ?? '',
    compatible_with: data.compatible_with ?? [],
    category: data.category ?? '',
  };
  const updated = [...parts, part];
  saveParts(updated);
  return part;
}

export function updatePart(id, data) {
  const parts = getParts();
  const updated = parts.map((p) =>
    p.id === id
      ? {
          ...p,
          name: data.name ?? p.name,
          description: data.description ?? p.description,
          price: Number(data.price ?? p.price),
          article: data.article ?? p.article,
          brand: data.brand ?? p.brand,
          material: data.material ?? p.material,
          compatible_with: data.compatible_with ?? p.compatible_with ?? [],
          category: data.category ?? p.category ?? '',
        }
      : p
  );
  saveParts(updated);
  return updated;
}

export function deletePart(id) {
  const updated = getParts().filter((p) => p.id !== id);
  saveParts(updated);
  return updated;
}
