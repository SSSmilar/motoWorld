import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  getParts,
  addPart,
  updatePart,
  deletePart,
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
  article: '',
  brand: '',
  material: '',
  compatible_with: [],
};

const PartManagement = () => {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => setParts(getParts());

  useEffect(() => {
    initAdminStorage().finally(reload);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCompatibility = (category) => {
    setForm((prev) => {
      const list = prev.compatible_with.includes(category)
        ? prev.compatible_with.filter((c) => c !== category)
        : [...prev.compatible_with, category];
      return { ...prev, compatible_with: list };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updatePart(editingId, form);
    } else {
      addPart(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    reload();
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      article: p.article ?? '',
      brand: p.brand ?? '',
      material: p.material ?? '',
      compatible_with: p.compatible_with ?? [],
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить запчасть?')) return;
    deletePart(id);
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
        <h2 className="text-2xl font-black uppercase">Запчасти</h2>
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
            <label className={LABEL_CLS}>Артикул</label>
            <input name="article" value={form.article} onChange={handleChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Цена (₽)</label>
            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Бренд</label>
            <input name="brand" value={form.brand} onChange={handleChange} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Материал</label>
            <input name="material" value={form.material} onChange={handleChange} className={INPUT_CLS} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={INPUT_CLS} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Совместимость (типы мотоциклов)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {VEHICLE_CATEGORIES.map((cat) => {
                const selected = form.compatible_with.includes(cat);
                return (
                  <label
                    key={cat}
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
                      onChange={() => toggleCompatibility(cat)}
                    />
                    {cat}
                  </label>
                );
              })}
            </div>
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
              <th className="py-3 pr-4">Артикул</th>
              <th className="py-3 pr-4">Бренд</th>
              <th className="py-3 pr-4">Материал</th>
              <th className="py-3 pr-4">Цена</th>
              <th className="py-3 pr-4">Совместимость</th>
              <th className="py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4 font-medium">{p.name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-400">{p.article}</td>
                <td className="py-3 pr-4 text-gray-400">{p.brand || '—'}</td>
                <td className="py-3 pr-4 text-gray-400">{p.material || '—'}</td>
                <td className="py-3 pr-4 text-accent">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">
                  {(p.compatible_with ?? []).join(', ') || '—'}
                </td>
                <td className="py-3 flex gap-2">
                  <button type="button" onClick={() => handleEdit(p)} className="p-2 hover:text-yellow-400 transition">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-400 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {parts.length === 0 && (
          <p className="text-gray-400 text-center py-6">Запчастей пока нет.</p>
        )}
      </div>
    </div>
  );
};

export default PartManagement;
