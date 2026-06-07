/**
 * Побитовая проверка совместимости запчастей с типом мотоцикла.
 *
 * Маски типов техники (vehicle_type_mask у мотоцикла):
 *   1 (0b001) — Питбайк
 *   2 (0b010) — Эндуро
 *   3 (0b011) — универсальная деталь (оба типа)
 *
 * У каждой запчасти есть compatible_mask — битовая маска совместимых типов.
 * Деталь подходит, если пересечение масок ненулевое:
 *   (part.compatible_mask & vehicle.vehicle_type_mask) !== 0
 *
 * Пример: PWK32 (mask=2, только эндуро) + Kayo питбайк (mask=1):
 *   2 & 1 = 0 → НЕ совместимо
 */
export function isPartCompatible(part, vehicle) {
  if (!part || !vehicle || part.type !== 'part' || vehicle.type !== 'vehicle') {
    return false;
  }

  const vehicleMask = vehicle.vehicle_type_mask ?? 0;
  const partMask = part.compatible_mask ?? 0;

  return (partMask & vehicleMask) !== 0;
}

/**
 * Проверяет массив выбранных запчастей.
 * Возвращает { valid: true } или { valid: false, error: string }.
 */
export function validateConfiguration(vehicle, selectedParts) {
  for (const part of selectedParts) {
    if (!isPartCompatible(part, vehicle)) {
      return {
        valid: false,
        error: `Ошибка: ${part.name} не совместим с типом техники ${vehicle.vehicle_type_name}!`,
      };
    }
  }

  return { valid: true };
}
