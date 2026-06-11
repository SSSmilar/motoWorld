/** Сумма без знака (для дельт в конфигураторе) */
export function formatPricePlain(rub) {
  const amount = Math.round(Math.abs(Number(rub) || 0));
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} руб.`;
}

/**
 * Подпись разницы цены относительно текущего выбора в категории.
 * Строго один знак: +, −, или «Включено» / «0 руб.».
 */
export function formatPriceDeltaLabel(delta, isSelected) {
  const value = Math.round(Number(delta) || 0);

  if (isSelected || value === 0) {
    return { label: 'Включено', className: 'text-gray-500' };
  }
  if (value > 0) {
    return { label: `+ ${formatPricePlain(value)}`, className: 'text-accent' };
  }
  return { label: `- ${formatPricePlain(value)}`, className: 'text-green-400' };
}
