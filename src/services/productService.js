import { fetchProducts, fetchProductById } from './configuratorService';
import { normalizeProduct } from '../utils/productUtils';

let cache = null;

export async function loadProducts() {
  const data = await fetchProducts();
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
  const numericId = Number(id);
  const cached = cache?.find((p) => p.id == id);
  if (cached) return cached;

  const product = await fetchProductById(id);
  const normalized = normalizeProduct(product);

  if (cache) {
    const idx = cache.findIndex((p) => p.id == id);
    if (idx >= 0) cache[idx] = normalized;
    else cache.push(normalized);
  }

  return normalized;
}

export function getVehicles(products = cache ?? []) {
  return products.filter((p) => p.type === 'vehicle');
}

export function getParts(products = cache ?? []) {
  return products.filter((p) => p.type === 'part');
}

/** @deprecated Каталог теперь на API; оставлено для совместимости */
export function initProducts() {}
