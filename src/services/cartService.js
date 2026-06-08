/**
 * Корзина в LocalStorage: обычные запчасти и кастомные сборки из конфигуратора.
 */

const get_cart_key = (user_id) => `cart_${user_id}`;

const genId = () => `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const get_cart = (user_id) => {
  try {
    const cart = localStorage.getItem(get_cart_key(user_id));
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const save_cart = (user_id, cart) => {
  try {
    localStorage.setItem(get_cart_key(user_id), JSON.stringify(cart));
  } catch { /* storage unavailable */ }
};

/** Добавить запчасть из каталога */
export const add_part_to_cart = (user_id, product, quantity = 1) => {
  const cart = get_cart(user_id);
  const existing = cart.find((item) => item.type === 'part' && item.productId === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      cartItemId: genId(),
      type: 'part',
      productId: product.id,
      name: product.name ?? product.title,
      price: product.price,
      image: product.image ?? product.imageUrl,
      quantity,
    });
  }

  save_cart(user_id, cart);
  return cart;
};

/** Добавить кастомную сборку из конфигуратора */
export const add_custom_build_to_cart = (user_id, build) => {
  const cart = get_cart(user_id);
  cart.push({
    cartItemId: genId(),
    type: 'custom_build',
    vehicleId: build.vehicleId,
    vehicleName: build.vehicleName,
    vehicleImage: build.vehicleImage,
    selectedPartIds: build.selectedPartIds,
    partNames: build.partNames,
    price: build.price,
    quantity: 1,
  });
  save_cart(user_id, cart);
  return cart;
};

/** @deprecated используйте add_part_to_cart */
export const add_to_cart = (user_id, product, quantity = 1) =>
  add_part_to_cart(user_id, product, quantity);

export const update_cart_item_quantity = (user_id, cartItemId, quantity) => {
  const cart = get_cart(user_id);
  const item = cart.find((i) => i.cartItemId === cartItemId);

  if (!item) return cart;

  if (item.type === 'custom_build') {
    return cart;
  }

  item.quantity = quantity;
  if (item.quantity <= 0) {
    return remove_from_cart(user_id, cartItemId);
  }

  save_cart(user_id, cart);
  return cart;
};

export const remove_from_cart = (user_id, cartItemId) => {
  const cart = get_cart(user_id).filter((item) => item.cartItemId !== cartItemId);
  save_cart(user_id, cart);
  return cart;
};

export const clear_cart = (user_id) => {
  localStorage.removeItem(get_cart_key(user_id));
};

/** Преобразование корзины в payload для POST /api/orders */
export const cart_to_order_items = (cart) =>
  cart.map((item) => {
    if (item.type === 'custom_build') {
      return {
        type: 'custom_build',
        vehicle_id: item.vehicleId,
        selected_part_ids: item.selectedPartIds,
        quantity: item.quantity ?? 1,
      };
    }
    return {
      type: 'part',
      product_id: item.productId,
      quantity: item.quantity ?? 1,
    };
  });

export const get_cart_total = (cart) =>
  cart.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
