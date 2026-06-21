import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  getMotorcycles,
  getParts,
  addMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  initAdminStorage,
} from '../../services/adminStorageService';
import { VEHICLE_CATEGORIES, ESSENTIAL_PART_CATEGORIES } from '../../utils/productUtils';
import { formatPrice } from '../../services/configuratorService';
import { invalidateProductCache } from '../../services/productService';
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

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const MotorcycleManagement = () => {
  const [motorcycles, setMotorcycles] = useState([]);
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

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

  const partCategoryById = useMemo(
    () => Object.fromEntries(parts.map((part) => [part.id, part.category || ''])),
    [parts]
  );

  const essentialPartsByCategory = useMemo(
    () =>
      ESSENTIAL_PART_CATEGORIES.map((category) => ({
        category,
        items: parts.filter((part) => part.category === category),
      })),
    [parts]
  );

  const getSelectedPartIdForCategory = (category) =>
    form.stockPartIds.find((id) => partCategoryById[id] === category) ?? '';

  const handleStockPartSelect = (category, value) => {
    if (!value) return;
    setForm((prev) => {
      const withoutCategory = prev.stockPartIds.filter(
        (id) => partCategoryById[id] !== category
      );
      return { ...prev, stockPartIds: [...withoutCategory, Number(value)] };
    });
    setFormError('');
  };

  const validateForm = () => {
    if (!form.image?.trim()) {
      return 'Добавьте изображение мотоцикла: загрузите файл или укажите URL';
    }

    for (const category of ESSENTIAL_PART_CATEGORIES) {
      const items = parts.filter((part) => part.category === category);
      if (items.length === 0) {
        return `Нет доступных запчастей в категории «${category}». Добавьте их в разделе «Запчасти».`;
      }
      if (!getSelectedPartIdForCategory(category)) {
        return `Пожалуйста, выберите стоковую деталь для категории «${category}»`;
      }
    }

    return null;
  };

  const canSubmit = useMemo(() => {
    if (!form.image?.trim()) return false;
    return ESSENTIAL_PART_CATEGORIES.every((category) => {
      const items = parts.filter((part) => part.category === category);
      if (items.length === 0) return false;
      return form.stockPartIds.some((id) => partCategoryById[id] === category);
    });
  }, [form.image, form.stockPartIds, parts, partCategoryById]);

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Выберите файл изображения (JPEG, PNG, WebP и т.д.)');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('Размер изображения не должен превышать 2 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
      setFormError('');
    };
    reader.onerror = () => setFormError('Не удалось прочитать файл изображения');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      category: form.category,
      volume: form.volume,
      power: form.power,
      year: form.year,
      stockPartIds: form.stockPartIds.filter((id) =>
        ESSENTIAL_PART_CATEGORIES.includes(partCategoryById[id])
      ),
      image: form.image,
      stock: form.stock,
    };

    if (editingId) {
      updateMotorcycle(editingId, payload);
    } else {
      addMotorcycle(payload);
    }

    invalidateProductCache();
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormError('');
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
    invalidateProductCache();
    reload();
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const imagePreview = form.image?.trim() ? form.image : null;
  const imageUrlValue = form.image?.startsWith('data:') ? '' : form.image;

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
            <label className={LABEL_CLS}>Изображение</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:font-semibold hover:file:bg-accent/90"
              />
              <input
                name="image"
                value={imageUrlValue}
                onChange={(e) => {
                  handleChange(e);
                  setFormError('');
                }}
                placeholder="Или вставьте URL: https://... или имя файла из /images/"
                className={INPUT_CLS}
              />
              {imagePreview && (
                <div className="relative w-full max-w-sm">
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full aspect-[4/3] object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/70 rounded hover:bg-red-600 transition"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLS}>Стоковые запчасти *</label>
            <p className="text-gray-500 text-xs mb-3">
              Обязательно выберите по одной запчасти из каждой основной категории.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {essentialPartsByCategory.map(({ category, items }) => (
                <div key={category}>
                  <label className={LABEL_CLS}>{category} *</label>
                  <select
                    value={String(getSelectedPartIdForCategory(category) || '')}
                    onChange={(e) => handleStockPartSelect(category, e.target.value)}
                    className={INPUT_CLS}
                    disabled={items.length === 0}
                    required
                  >
                    <option value="" disabled className="bg-gray-900">
                      Выберите запчасть
                    </option>
                    {items.map((part) => (
                      <option key={part.id} value={part.id} className="bg-gray-900">
                        {part.name}
                      </option>
                    ))}
                  </select>
                  {items.length === 0 && (
                    <p className="text-red-400 text-xs mt-1">
                      Нет запчастей в этой категории — добавьте в разделе «Запчасти»
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {formError && (
            <div className="md:col-span-2 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
              {formError}
            </div>
          )}
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className={`${BTN_PRIMARY} disabled:opacity-40 disabled:cursor-not-allowed`} disabled={!canSubmit}>
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
