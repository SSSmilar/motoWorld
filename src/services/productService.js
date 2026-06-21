import { fetchProductById } from './configuratorService';
import { normalizeProduct } from '../utils/productUtils';
import {
  buildCatalogProducts,
  getMotorcycles,
  motorcycleToVehicleProduct,
} from './adminStorageService';

let cache = null;

export function invalidateProductCache() {
  cache = null;
}

export async function loadProducts(force = false) {
  if (cache && !force) return cache;

  const data = await buildCatalogProducts();
  cache = data.map(normalizeProduct);
  return cache;
}

export function getCachedProducts() {
  return cache ?? [];
}

export async function getProducts() {
  if (cache) return cache;
  return loadProducts();
}

export async function getProductById(id) {
  const cached = cache?.find((p) => p.id == id);
  if (cached) return cached;

  const motorcycle = getMotorcycles().find((m) => m.id == id);
  if (motorcycle) {
    const normalized = normalizeProduct(motorcycleToVehicleProduct(motorcycle));
    if (cache) cache.push(normalized);
    return normalized;
  }

  try {
    const product = await fetchProductById(id);
    const normalized = normalizeProduct(product);

    if (cache) {
      const idx = cache.findIndex((p) => p.id == id);
      if (idx >= 0) cache[idx] = normalized;
      else cache.push(normalized);
    }

    return normalized;
  } catch {
    return null;
  }
}

export function getVehicles(products = cache ?? []) {
  return products.filter((p) => p.type === 'vehicle');
}

export function getParts(products = cache ?? []) {
  return products.filter((p) => p.type === 'part');
}

/** In-memory CRUD для админ-панели (без персистентности на сервере) */
export function addProduct(data) {
  if (!cache) cache = [];
  const maxId = cache.reduce((max, p) => Math.max(max, p.id), 0);
  const product = normalizeProduct({
    id: maxId + 1,
    type: 'part',
    category: data.category ?? 'other',
    name: data.name ?? data.title ?? '',
    price: Number(data.price) || 0,
    description: data.description ?? '',
    image: data.imageUrl ?? data.image ?? '',
    stock: Number(data.stock) || 0,
  });
  cache.push(product);
  return product;
}

export function updateProduct(id, data) {
  if (!cache) return;
  const idx = cache.findIndex((p) => p.id == id);
  if (idx < 0) return;
  cache[idx] = normalizeProduct({
    ...cache[idx],
    name: data.name ?? data.title ?? cache[idx].name,
    price: Number(data.price ?? cache[idx].price),
    description: data.description ?? cache[idx].description,
    image: data.imageUrl ?? data.image ?? cache[idx].image,
    stock: Number(data.stock ?? cache[idx].stock),
  });
}

export function deleteProduct(id) {
  if (!cache) return;
  cache = cache.filter((p) => p.id != id);
}

/** @deprecated Каталог теперь на API; оставлено для совместимости */
export function initProducts() {}
