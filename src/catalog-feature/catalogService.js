import { mockCatalogData } from './mockCatalogData';

/**
 * Имитация API для получения списка товаров.
 * Возвращает Promise с задержкой 500-800мс.
 */
export const fetchCatalogData = () => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (1000 - 800 + 1)) + 800;
    setTimeout(() => {
      resolve(mockCatalogData);
    }, delay);
  });
};

/**
 * Получение популярных моделей (isTop: true).
 */
export const getTopModels = () => {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (1000 - 800 + 1)) + 800;
    setTimeout(() => {
      const topModels = mockCatalogData.filter(moto => moto.isTop);
      resolve(topModels);
    }, delay);
  });
};
