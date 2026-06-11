import { findProductById, getAssemblyRule } from './db.js';
import { validateConfiguration } from './compatibility.js';

/**
 * В одной категории может быть только одна запчасть.
 * Если выбрано несколько — приоритет у тюнинга (не из default_parts).
 */
export function resolvePartsByCategory(selectedPartIds, stockPartIds = []) {
  const stockSet = new Set(stockPartIds);
  const byCategory = {};

  for (const partId of selectedPartIds) {
    const part = findProductById(partId);
    if (!part || part.type !== 'part') continue;

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

/** Цена кастомной сборки: мотоцикл + выбранные запчасти (с учётом замены стока). */
export function calculateCustomBuildPrice(vehicleId, selectedPartIds) {
  const vehicle = findProductById(vehicleId);
  if (!vehicle || vehicle.type !== 'vehicle') {
    throw new Error('Мотоцикл не найден');
  }

  const rule = getAssemblyRule(vehicleId);
  const stockIds = rule?.default_parts ?? [];
  const resolvedParts = resolvePartsByCategory(selectedPartIds, stockIds);
  const partsTotal = resolvedParts.reduce((sum, p) => sum + p.price, 0);

  return {
    vehicle,
    resolvedParts,
    resolvedPartIds: resolvedParts.map((p) => p.id),
    total: vehicle.price + partsTotal,
  };
}

/** Расчёт и валидация позиции корзины. */
export function processCartItem(item) {
  if (item.type === 'part') {
    const product = findProductById(item.product_id);
    if (!product || product.type !== 'part') {
      throw new Error(`Запчасть ${item.product_id} не найдена`);
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    return {
      type: 'part',
      product_id: product.id,
      name: product.name,
      quantity,
      unit_price: product.price,
      line_total: product.price * quantity,
    };
  }

  if (item.type === 'custom_build') {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const { vehicle, resolvedParts, resolvedPartIds, total } = calculateCustomBuildPrice(
      item.vehicle_id,
      item.selected_part_ids ?? []
    );

    const compatibility = validateConfiguration(vehicle, resolvedParts);
    if (!compatibility.valid) {
      throw new Error(compatibility.error);
    }

    return {
      type: 'custom_build',
      vehicle_id: vehicle.id,
      vehicle_name: vehicle.name,
      selected_part_ids: resolvedPartIds,
      part_names: resolvedParts.map((p) => p.name),
      quantity,
      unit_price: total,
      line_total: total * quantity,
    };
  }

  throw new Error(`Неизвестный тип позиции: ${item.type}`);
}

/** Серверный пересчёт всей корзины. */
export function calculateOrderTotal(items) {
  const processed = items.map(processCartItem);
  const total = processed.reduce((sum, item) => sum + item.line_total, 0);
  return { items: processed, total };
}
