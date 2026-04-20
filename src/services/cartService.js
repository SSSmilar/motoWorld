/**
 * Сервис корзины (mock-api).
 * Корзина привязана к userId и хранится в LocalStorage по ключу "mw_cart_{userId}".
 * Формат: массив { productId, quantity }.
 */

const get_cart_key = (user_id) => `cart_${user_id}`;

export const get_cart = (user_id) => {
    const cart_key = get_cart_key(user_id);
    const cart = localStorage.getItem(cart_key);
    return cart ? JSON.parse(cart) : [];
};

const save_cart = (user_id, cart) => {
    const cart_key = get_cart_key(user_id);
    localStorage.setItem(cart_key, JSON.stringify(cart));
};

export const add_to_cart = (user_id, product, quantity) => {
    const cart = get_cart(user_id);
    const existing_item = cart.find(item => item.id === product.id);

    if (existing_item) {
        existing_item.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    save_cart(user_id, cart);
};

export const update_cart_item_quantity = (user_id, product_id, quantity) => {
    const cart = get_cart(user_id);
    const item = cart.find(item => item.id === product_id);

    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            remove_from_cart(user_id, product_id);
        } else {
            save_cart(user_id, cart);
        }
    }
};

export const remove_from_cart = (user_id, product_id) => {
    let cart = get_cart(user_id);
    cart = cart.filter(item => item.id !== product_id);
    save_cart(user_id, cart);
};

export const clear_cart = (user_id) => {
    const cart_key = get_cart_key(user_id);
    localStorage.removeItem(cart_key);
};
