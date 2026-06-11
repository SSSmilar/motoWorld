/** Сумма без знака (для дельт в конфигураторе) */
export function formatPricePlain(rub) {
  const amount = Math.round(Math.abs(Number(rub) || 0));
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} руб.`;
}

/**
 * Подпись разницы цены относительно текущего активного выбора в категории.
 * «0 рублей» — только у выбранной детали; у остальных строго + или −.
 */
export function formatPriceDeltaLabel(delta, isSelected) {
  const value = Math.round(Number(delta) || 0);

  if (isSelected) {
    return { label: '0 рублей', className: 'text-gray-500' };
  }
  if (value > 0) {
    return { label: `+ ${formatPricePlain(value)}`, className: 'text-accent' };
  }
  if (value < 0) {
    return { label: `- ${formatPricePlain(value)}`, className: 'text-green-400' };
  }
  return { label: `+ ${formatPricePlain(0)}`, className: 'text-gray-400' };
}
