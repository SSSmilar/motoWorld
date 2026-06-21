import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  getMotorcycles,
  getParts,
  addMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  initAdminStorage,
} from '../../services/adminStorageService';
import { VEHICLE_CATEGORIES } from '../../utils/productUtils';
import { formatPrice } from '../../services/configuratorService';
import {
  INPUT_CLS,
  LABEL_CLS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD_CLS,
} from './adminStyles';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  volume: '',
  power: '',
  year: new Date().getFullYear(),
  category: VEHICLE_CATEGORIES[0],
  stockPartIds: [],
  image: '',
  stock: 3,
};

const MotorcycleManagement = () => {
  const [motorcycles, setMotorcycles] = useState([]);
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => {
    setMotorcycles(getMotorcycles());
    setParts(getParts());
  };

  useEffect(() => {
    initAdminStorage().finally(reload);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStockPart = (partId) => {
    setForm((prev) => {
      const ids = prev.stockPartIds.includes(partId)
        ? prev.stockPartIds.filter((id) => id !== partId)
        : [...prev.stockPartIds, partId];
      return { ...prev, stockPartIds: ids };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      category: form.category,
      volume: form.volume,
      power: form.power,
      year: form.year,
      stockPartIds: form.stockPartIds,
      image: form.image,
      stock: form.stock,
    };

    if (editingId) {
      updateMotorcycle(editingId, payload);
    } else {
      addMotorcycle(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    reload();
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name,
      description: m.description ?? '',
      price: m.price,
      volume: m.specs?.volume ?? '',
      power: m.specs?.power ?? '',
      year: m.specs?.year ?? new Date().getFullYear(),
      category: m.category ?? VEHICLE_CATEGORIES[0],
      stockPartIds: m.stockPartIds ?? [],
      image: m.image ?? '',
      stock: m.stock ?? 3,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить мотоцикл?')) return;
    deleteMotorcycle(id);
    reload();
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase">Мотоциклы</h2>
        <button
          type="button"
          onClick={openCreateForm}
          className={`${BTN_PRIMARY} flex items-center gap-2`}
        >
          <Plus size={18} />
          Добавить
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${CARD_CLS} mb-8 grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div>
            <label className={LABEL_CLS}>Название</label>
            <input name="name" value={form.name} onChange={handleChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Тип</label>
            <select name="category" value={form.category} onChange={handleChange} className={INPUT_CLS}>
              {VEHICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Цена (₽)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Объём двигателя</label>
            <input name="volume" value={form.volume} onChange={handleChange} placeholder="890 см³" className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Мощность</label>
            <input name="power" value={form.power} onChange={handleChange} placeholder="117 л.с." className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Год</label>
            <input name="year" type="number" min="1900" max="2100" value={form.year} onChange={handleChange} className={INPUT_CLS} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={INPUT_CLS} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Стоковые запчасти</label>
            {parts.length === 0 ? (
              <p className="text-gray-500 text-sm">Сначала добавьте запчасти в разделе «Запчасти».</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {parts.map((part) => {
                  const selected = form.stockPartIds.includes(part.id);
                  return (
                    <label
                      key={part.id}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm border transition ${
                        selected
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => toggleStockPart(part.id)}
                      />
                      {part.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className={BTN_PRIMARY}>
              {editingId ? 'Сохранить' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className={BTN_SECONDARY}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className={`${CARD_CLS} overflow-x-auto`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Тип</th>
              <th className="py-3 pr-4">Характеристики</th>
              <th className="py-3 pr-4">Цена</th>
              <th className="py-3 pr-4">Сток. запчасти</th>
              <th className="py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {motorcycles.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4 font-medium">{m.name}</td>
                <td className="py-3 pr-4 text-gray-400">{m.category}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">
                  {[m.specs?.volume, m.specs?.power, m.specs?.year].filter(Boolean).join(' · ')}
                </td>
                <td className="py-3 pr-4 text-accent">{formatPrice(m.price)}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">
                  {(m.stockPartIds ?? []).length || '—'}
                </td>
                <td className="py-3 flex gap-2">
                  <button type="button" onClick={() => handleEdit(m)} className="p-2 hover:text-yellow-400 transition">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(m.id)} className="p-2 hover:text-red-400 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {motorcycles.length === 0 && (
          <p className="text-gray-400 text-center py-6">Мотоциклов пока нет.</p>
        )}
      </div>
    </div>
  );
};

export default MotorcycleManagement;
