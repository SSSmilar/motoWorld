/** Форматирование суммы без знака ± (для дельт в конфигураторе) */
export function formatPricePlain(rub) {
  const amount = Math.round(Number(rub) || 0);
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} ₽`;
}

/**
 * Подпись разницы цены относительно текущего выбора в категории.
 * Строго один знак: +, -, или «Включено в стоимость».
 */
export function formatPriceDeltaLabel(delta, isSelected) {
  const value = Math.round(Number(delta) || 0);

  if (isSelected) {
    return { label: '✓ выбрано', className: 'text-green-400' };
  }
  if (value === 0) {
    return { label: 'Включено в стоимость', className: 'text-gray-500' };
  }
  if (value > 0) {
    return { label: `+ ${formatPricePlain(value)}`, className: 'text-accent' };
  }
  return { label: `- ${formatPricePlain(Math.abs(value))}`, className: 'text-green-400' };
}
