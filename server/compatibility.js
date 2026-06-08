/**
 * Проверка совместимости запчасти с мотоциклом через массив compatible_with.
 * Деталь подходит, если категория мотоцикла есть в part.compatible_with.
 */
export function isPartCompatible(part, vehicle) {
  if (!part || !vehicle || part.type !== 'part' || vehicle.type !== 'vehicle') {
    return false;
  }

  const category = vehicle.category?.toLowerCase();
  return Array.isArray(part.compatible_with) && part.compatible_with.includes(category);
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
        error: `Ошибка: ${part.name} не совместим с типом техники ${vehicle.name}!`,
      };
    }
  }

  return { valid: true };
}
