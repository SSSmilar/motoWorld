import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'database.json');

/**
 * Глобальное in-memory хранилище.
 * Загружается ОДИН раз при старте сервера — все чтения идут из RAM.
 */
let memoryDb = null;
let isLoaded = false;

/**
 * Однократная загрузка database.json в оперативную память.
 */
export async function loadDatabase() {
  if (isLoaded && memoryDb) {
    return memoryDb;
  }

  const raw = await readFile(DB_PATH, 'utf-8');
  memoryDb = JSON.parse(raw);
  isLoaded = true;
  console.log('[DB] database.json загружен в память');
  return memoryDb;
}

/**
 * Синхронный доступ к данным из памяти (после loadDatabase).
 */
export function getDb() {
  if (!memoryDb) {
    throw new Error('База данных не загружена. Вызовите loadDatabase() при старте сервера.');
  }
  return memoryDb;
}

/**
 * Асинхронная персистентность: сериализует RAM → database.json.
 * Вызывается после изменений (создание заказа и т.д.).
 */
export async function saveToDisk() {
  if (!memoryDb) {
    throw new Error('Нет данных для сохранения.');
  }

  try {
    await writeFile(DB_PATH, JSON.stringify(memoryDb, null, 2), 'utf-8');
    console.log('[DB] Состояние памяти сохранено в database.json');
  } catch (err) {
    // На Vercel файловая система read-only — заказ остаётся в RAM текущего инстанса
    console.warn('[DB] saveToDisk пропущен (read-only FS):', err.message);
  }
}

export function findProductById(id) {
  return getDb().products.find((p) => p.id == id) ?? null;
}

export function getVehicles() {
  return getDb().products.filter((p) => p.type === 'vehicle');
}

export function getParts() {
  return getDb().products.filter((p) => p.type === 'part');
}

export function getAssemblyRule(vehicleId) {
  return getDb().assembly_rules.find((r) => r.vehicle_id == vehicleId) ?? null;
}

export function addOrder(order) {
  getDb().orders.push(order);
}
