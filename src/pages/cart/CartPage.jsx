import React, { useState, useEffect } from 'react';
import { get_cart, update_cart_item_quantity, remove_from_cart, clear_cart } from '../../services/cartService';
import { create_order } from '../../services/orderService';
import { get_current_user } from '../../services/authService';
import { getProductById as get_product_by_id } from '../../services/productService';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const user = get_current_user();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setCart(get_cart(user.userId));
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleQuantityChange = (productId, quantity) => {
        const product = get_product_by_id(productId);
        if (quantity > product.stock) {
            alert(`Only ${product.stock} items available.`);
            quantity = product.stock;
        }
        if (quantity < 1) {
            quantity = 1;
        }
        update_cart_item_quantity(user.userId, productId, quantity);
        setCart(get_cart(user.userId));
    };

    const handleRemove = (productId) => {
        remove_from_cart(user.userId, productId);
        setCart(get_cart(user.userId));
    };

    const handleCheckout = () => {
        try {
            create_order(user.userId, cart);
            clear_cart(user.userId);
            setCart([]);
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            alert('Failed to place order: ' + error.message);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">Корзина</h1>
                <p className="text-gray-400">Ваша корзина пуста.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Корзина</h1>
            <div className="space-y-4">
                {cart.map((item) => {
                    const product = get_product_by_id(item.id);
                    return (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-gray-400 text-sm">${item.price?.toLocaleString()} × {item.quantity}</p>
                                <p className="text-xs text-gray-500">На складе: {product?.stock}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="p-1 rounded bg-white/10 hover:bg-white/20 transition">
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={item.quantity >= product?.stock} className="p-1 rounded bg-white/10 hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button onClick={() => handleRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 transition">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex justify-between items-center">
                <button onClick={() => { clear_cart(user.userId); setCart([]); }} className="text-sm text-gray-400 hover:text-white transition underline">
                    Очистить корзину
                </button>
                <div>
                    <p className="text-2xl font-bold">Итого: ${cartTotal.toLocaleString()}</p>
                    <button onClick={handleCheckout} className="bg-indigo-600 hover:bg-indigo-700 transition rounded-lg px-6 py-2 font-semibold mt-2">
                        Оформить заказ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
