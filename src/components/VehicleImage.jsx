import React from 'react';

/** Единый стиль превью мотоциклов (эталон — карточка Ducati Panigale V4 в каталоге) */
export const vehicleImageFrameClass = 'relative overflow-hidden aspect-[16/9]';
export const vehicleImageImgClass =
  'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110';

const VehicleImage = ({ src, alt, frameClassName = '', imgClassName = '', hover = true }) => (
  <div className={`${vehicleImageFrameClass} ${frameClassName}`.trim()}>
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${hover ? 'transition-transform duration-500 group-hover:scale-110' : ''} ${imgClassName}`.trim()}
    />
  </div>
);

export default VehicleImage;
