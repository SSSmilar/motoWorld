import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import { Pencil, Trash2, Plus } from 'lucide-react';

const emptyForm = { title: '', price: '', description: '', imageUrl: '', stock: '', category: '' };

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => setProducts(getProducts());
  useEffect(reload, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, form);
    } else {
      addProduct(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    reload();
  };

  const handleEdit = (p) => {
    setForm({ title: p.title, price: p.price, description: p.description, imageUrl: p.imageUrl, stock: p.stock, category: p.category || '' });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    reload();
  };

  const inputCls = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-red-500';

  return (
    <div className="min-h-screen pt-28 px-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Админ-панель — Товары</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition rounded-lg px-4 py-2 font-semibold">
          <Plus size={18} /> Добавить товар
        </button>
      </div>

      {/* Форма добавления / редактирования */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Название</label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm mb-1">Категория</label>
            <input name="category" value={form.category} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm mb-1">Цена ($)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm mb-1">Остаток на складе</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Ссылка на картинку</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-red-600 hover:bg-red-700 transition rounded-lg px-6 py-2 font-semibold">
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-white/10 hover:bg-white/20 transition rounded-lg px-6 py-2">
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Таблица товаров */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="py-3 pr-4">Фото</th>
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Цена</th>
              <th className="py-3 pr-4">Остаток</th>
              <th className="py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 pr-4">
                  <img src={p.imageUrl} alt={p.title} className="w-14 h-14 object-cover rounded" />
                </td>
                <td className="py-2 pr-4 font-medium">{p.title}</td>
                <td className="py-2 pr-4">${p.price.toLocaleString()}</td>
                <td className="py-2 pr-4">{p.stock}</td>
                <td className="py-2 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 hover:text-yellow-400 transition"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-400 transition"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
