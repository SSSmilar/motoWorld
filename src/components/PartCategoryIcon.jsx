import React from 'react';
import { getPartCategoryIcon } from '../utils/partCategoryIcons';

const SIZES = {
  sm: { box: 'w-10 h-10', icon: 18 },
  md: { box: 'w-14 h-14', icon: 24 },
};

/** Графическая заглушка запчасти по категории */
const PartCategoryIcon = ({ category, size = 'md', className = '' }) => {
  const Icon = getPartCategoryIcon(category);
  const { box, icon } = SIZES[size] ?? SIZES.md;

  return (
    <div
      className={`${box} shrink-0 flex items-center justify-center border border-white/10 bg-white/5 rounded-sm ${className}`}
      aria-hidden
    >
      <Icon size={icon} className="text-accent" strokeWidth={1.75} />
    </div>
  );
};

export default PartCategoryIcon;
