/** Нормализация товара из API к единому формату фронтенда */
export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    title: p.name ?? p.title,
    name: p.name ?? p.title,
    imageUrl: p.image ?? p.imageUrl,
    image: p.image ?? p.imageUrl,
    stock: p.stock ?? (p.type === 'vehicle' ? 3 : 15),
  };
}

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

export const VEHICLE_CATEGORY_LABELS = {
  sport: 'Спорт',
  cruiser: 'Круизер',
  enduro: 'Эндуро',
  road: 'Дорожный',
  pitbike: 'Питбайк',
  cross: 'Кросс',
};

export const PART_CATEGORY_LABELS = {
  carburetor: 'Карбюратор',
  chain: 'Цепь',
  tires: 'Резина',
  exhaust: 'Выхлоп',
  luggage: 'Багаж',
  handlebars: 'Руль',
  protection: 'Защита',
  brakes: 'Тормоза',
  body: 'Кузов',
  seat: 'Сиденье',
  lighting: 'Освещение',
  sprockets: 'Звёзды',
  footpegs: 'Подножки',
  electronics: 'Электроника',
};
