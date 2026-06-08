/** Преобразует локальное имя файла в URL для public/images */
export function resolveProductImage(p) {
  const src = p?.image ?? p?.imageUrl;
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/images/${src}`;
}

/** Нормализация товара из API к единому формату фронтенда */
export function normalizeProduct(p) {
  if (!p) return null;
  const imageUrl = resolveProductImage(p);
  return {
    ...p,
    title: p.name ?? p.title,
    name: p.name ?? p.title,
    imageUrl,
    image: imageUrl,
    stock: p.stock ?? (p.type === 'vehicle' ? 3 : 15),
  };
}

/** Категории мотоциклов (для фильтров каталога) */
export const VEHICLE_CATEGORIES = [
  'Спорт',
  'Круизер',
  'Эндуро',
  'Дорожный',
  'Питбайк',
  'Кросс',
];

/** Категории запчастей (для фильтров каталога) */
export const PART_CATEGORIES = [
  'Карбюраторы',
  'Цепи и звезды',
  'Рули',
  'Выхлоп',
  'Покрышки',
  'Защита',
  'Тормоза',
  'Багаж',
  'Кузов',
  'Сиденья',
  'Освещение',
  'Подножки',
  'Электроника',
];

/** Одна запчасть на категорию; тюнинг заменяет сток */
export function resolvePartsByCategory(allParts, selectedPartIds, stockPartIds = []) {
  const stockSet = new Set(stockPartIds);
  const partsMap = new Map(allParts.map((p) => [p.id, p]));
  const byCategory = {};

  for (const partId of selectedPartIds) {
    const part = partsMap.get(partId);
    if (!part) continue;

    const existing = byCategory[part.category];
    if (!existing) {
      byCategory[part.category] = part;
      continue;
    }

    const existingIsStock = stockSet.has(existing.id);
    const currentIsStock = stockSet.has(part.id);
    if (existingIsStock && !currentIsStock) {
      byCategory[part.category] = part;
    }
  }

  return Object.values(byCategory);
}

/** Расчёт цены кастомной сборки на клиенте */
export function calculateBuildPrice(vehicle, selectedPartIds, allParts, stockPartIds = []) {
  if (!vehicle) return { partsTotal: 0, total: 0, resolvedParts: [] };

  const resolvedParts = resolvePartsByCategory(allParts, selectedPartIds, stockPartIds);
  const partsTotal = resolvedParts.reduce((sum, p) => sum + p.price, 0);

  return {
    resolvedParts,
    partsTotal,
    total: vehicle.price + partsTotal,
  };
}

/** Проверка совместимости на клиенте (категории на русском) */
export function isPartCompatibleWithVehicle(part, vehicle) {
  if (!part?.compatible_with || !vehicle?.category) return false;
  return part.compatible_with.includes(vehicle.category);
}

export function getCategoriesForType(type) {
  return type === 'vehicle' ? VEHICLE_CATEGORIES : PART_CATEGORIES;
}
