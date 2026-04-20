// src/pages/admin/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { getProducts as get_all_products, addProduct as add_product, updateProduct as update_product, deleteProduct as delete_product } from '../../services/productService';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', description: '', imageUrl: '', stock: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        setProducts(get_all_products());
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            update_product(editingId, form);
        } else {
            add_product(form);
        }
        setProducts(get_all_products());
        setForm({ name: '', price: '', description: '', imageUrl: '', stock: '' });
        setEditingId(null);
    };

    const handleEdit = (product) => {
        setForm(product);
        setEditingId(product.id);
    };

    const handleDelete = (id) => {
        delete_product(id);
        setProducts(get_all_products());
    };

    return (
        <div>
            <h2>Product Management</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL" required />
                <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" required />
                <button type="submit">{editingId ? 'Update' : 'Add'} Product</button>
            </form>
            <ul>
                {products.map(p => (
                    <li key={p.id}>
                        {p.name} - ${p.price} - Stock: {p.stock}
                        <button onClick={() => handleEdit(p)}>Edit</button>
                        <button onClick={() => handleDelete(p.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManagement;

