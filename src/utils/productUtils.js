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

/** Основные категории — без них мотоцикл не может быть собран */
export const ESSENTIAL_PART_CATEGORIES = [
  'Карбюраторы',
  'Покрышки',
  'Тормоза',
  'Цепи и звезды',
];

export function isEssentialPartCategory(category) {
  return ESSENTIAL_PART_CATEGORIES.includes(category);
}

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

function sumPartsPrice(parts) {
  return parts.reduce((sum, p) => sum + p.price, 0);
}

/** Сумма стоковых запчастей по ID */
export function calculateStockPartsTotal(allParts, stockPartIds = []) {
  const stockSet = new Set(stockPartIds);
  return sumPartsPrice(allParts.filter((p) => stockSet.has(p.id)));
}

/** Активный компонент в каждой категории (с учётом приоритета тюнинга) */
export function getActivePartsByCategory(allParts, selectedPartIds, stockPartIds = []) {
  const resolved = resolvePartsByCategory(allParts, selectedPartIds, stockPartIds);
  return Object.fromEntries(resolved.map((part) => [part.category, part]));
}

/** Разница цены детали относительно текущего активного выбора в категории */
export function computePartPriceDelta(part, activeByCategory) {
  const current = activeByCategory[part.category];
  if (!current) return part.price;
  if (current.id === part.id) return 0;
  return part.price - current.price;
}

/** Полная стоимость мотоцикла в базовой комплектации: рама + 4 стоковых детали */
export function calculateVehicleCatalogPrice(vehicle, stockParts = []) {
  const stockTotal = sumPartsPrice(stockParts);
  return {
    framePrice: vehicle?.price ?? 0,
    stockTotal,
    catalogPrice: (vehicle?.price ?? 0) + stockTotal,
  };
}

/**
 * Расчёт цены сборки: vehicle.price — рама, к ней суммируются выбранные запчасти.
 * Стартовая цена (все стоки) = catalogPrice; тюнинг меняет сумму деталей.
 */
export function calculateBuildPrice(vehicle, selectedPartIds, allParts, stockPartIds = []) {
  if (!vehicle) {
    return {
      partsTotal: 0,
      stockTotal: 0,
      partsDelta: 0,
      catalogPrice: 0,
      total: 0,
      resolvedParts: [],
    };
  }

  const resolvedParts = resolvePartsByCategory(allParts, selectedPartIds, stockPartIds);
  const partsTotal = sumPartsPrice(resolvedParts);
  const stockTotal = calculateStockPartsTotal(allParts, stockPartIds);
  const partsDelta = partsTotal - stockTotal;
  const catalogPrice = vehicle.price + stockTotal;

  return {
    resolvedParts,
    partsTotal,
    stockTotal,
    partsDelta,
    catalogPrice,
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
