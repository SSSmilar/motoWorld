/**
 * Сервис товаров (mock-api).
 * Хранит каталог мотоциклов в LocalStorage по ключу "mw_products".
 * При первом запуске инициализирует данные из mockCatalogData с добавлением поля stock.
 */

import { mockCatalogData } from '../catalog-feature/mockCatalogData';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_KEY = 'mw_products';

/** Инициализация каталога: переносит начальные данные в LocalStorage (один раз) */
export function initProducts() {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    // Конвертируем inStock (boolean) → stock (число)
    const products = mockCatalogData.map((m) => ({
      id: m.id,
      title: m.title,
      price: m.price,
      category: m.category,
      stock: m.inStock ? Math.floor(Math.random() * 10) + 1 : 0,
      imageUrl: m.imageUrl,
      description: m.description,
    }));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
}

const get_products = () => {
    try {
        const products = localStorage.getItem(PRODUCTS_KEY);
        return products ? JSON.parse(products) : [];
    } catch {
        return [];
    }
};

const save_products = (products) => {
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch { /* storage full or unavailable */ }
};

/** Получить все товары */
export function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
  } catch {
    return [];
  }
}

/** Получить товар по id */
export function getProductById(id) {
  const products = get_products();
  return products.find(p => p.id === id);
}

/** Добавить новый товар (admin) */
export function addProduct({ title, price, description, imageUrl, stock, category }) {
  const products = get_products();
  const new_product = {
    id: uuidv4(),
    title,
    price: Number(price),
    description,
    imageUrl,
    stock: Math.max(0, Number(stock)),
    category: category || 'Other',
  };
  products.push(new_product);
  save_products(products);
  return new_product;
}

/** Обновить товар (admin) */
export function updateProduct(id, data) {
  const products = get_products();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
      throw new Error('Product not found.');
  }
  products[index] = { ...products[index], ...data };
  save_products(products);
  return products[index];
}

/** Удалить товар (admin) */
export function deleteProduct(id) {
  let products = get_products();
  products = products.filter(p => p.id !== id);
  save_products(products);
}

export const update_stock = (product_id, quantity_change) => {
    const products = get_products();
    const index = products.findIndex(p => p.id === product_id);
    if (index !== -1) {
        products[index].stock += quantity_change;
        save_products(products);
    }
};
