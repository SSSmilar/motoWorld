import {
  Cpu,
  Link,
  Move,
  Flame,
  Disc,
  Shield,
  CircleStop,
  Package,
  Layout,
  Armchair,
  Lightbulb,
  Footprints,
  Zap,
  Wrench,
} from 'lucide-react';

/** Иконка lucide-react по русской категории запчасти */
const CATEGORY_ICON_MAP = {
  Карбюраторы: Cpu,
  'Цепи и звезды': Link,
  Рули: Move,
  Выхлоп: Flame,
  Покрышки: Disc,
  Защита: Shield,
  Тормоза: CircleStop,
  Багаж: Package,
  Кузов: Layout,
  Сиденья: Armchair,
  Освещение: Lightbulb,
  Подножки: Footprints,
  Электроника: Zap,
};

export function getPartCategoryIcon(category) {
  return CATEGORY_ICON_MAP[category] ?? Wrench;
}
