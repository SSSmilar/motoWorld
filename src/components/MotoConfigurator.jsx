import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Wrench, Sparkles, Loader2 } from 'lucide-react';
import {
  fetchProducts,
  fetchStockParts,
  fetchCompatibleTuning,
  createOrder,
  formatPrice,
} from '../services/configuratorService';

const CATEGORY_LABELS = {
  carburetor: 'Карбюратор',
  chain: 'Цепь',
  tires: 'Резина',
  exhaust: 'Выхлоп',
  luggage: 'Багаж',
  handlebars: 'Руль',
  protection: 'Защита',
  brakes: 'Тормоза',
  body: 'Кузов',
  seat: 'Сиденье',
  lighting: 'Освещение',
  sprockets: 'Звёзды',
  footpegs: 'Подножки',
  electronics: 'Электроника',
};

const VEHICLE_CATEGORY_LABELS = {
  sport: 'Спорт',
  cruiser: 'Круизер',
  enduro: 'Эндуро',
  road: 'Дорожный',
  pitbike: 'Питбайк',
};

function PartRow({ part, checked, onToggle, badge }) {
  return (
    <label className="flex items-center justify-between gap-4 p-3 rounded border border-white/5 hover:border-accent/30 cursor-pointer transition-colors bg-black/20">
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(part.id)}
          className="w-4 h-4 accent-accent shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{part.name}</span>
            {badge && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-accent/20 text-accent font-bold">
                {badge}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {CATEGORY_LABELS[part.category] ?? part.category}
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-400 shrink-0">+{formatPrice(part.price)}</span>
    </label>
  );
}

const MotoConfigurator = () => {
  const [vehicles, setVehicles] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stockParts, setStockParts] = useState([]);
  const [tuningParts, setTuningParts] = useState([]);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingParts, setLoadingParts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const loadVehicleParts = useCallback(async (vehicle) => {
    if (!vehicle) return;
    setLoadingParts(true);
    setValidationError('');
    setOrderSuccess(false);

    try {
      const [stock, tuning] = await Promise.all([
        fetchStockParts(vehicle.id),
        fetchCompatibleTuning(vehicle.id),
      ]);
      setStockParts(stock);
      setTuningParts(tuning);
      setSelectedPartIds(stock.map((p) => p.id));
    } catch (err) {
      setValidationError(err.message || 'Не удалось загрузить запчасти');
      setStockParts([]);
      setTuningParts([]);
      setSelectedPartIds([]);
    } finally {
      setLoadingParts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        const v = data.filter((p) => p.type === 'vehicle');
        const p = data.filter((p) => p.type === 'part');
        setVehicles(v);
        setAllParts(p);
        if (v.length > 0) {
          setSelectedVehicle(v[0]);
          loadVehicleParts(v[0]);
        }
      })
      .catch((err) => setValidationError(err.message || 'Не удалось загрузить каталог'))
      .finally(() => setLoading(false));
  }, [loadVehicleParts]);

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === Number(vehicleId));
    if (!vehicle) return;
    setSelectedVehicle(vehicle);
    loadVehicleParts(vehicle);
  };

  const handlePartToggle = (partId) => {
    const part = allParts.find((p) => p.id === partId);
    const isAdding = !selectedPartIds.includes(partId);

    if (isAdding && part && selectedVehicle) {
      const category = selectedVehicle.category.toLowerCase();
      if (!part.compatible_with?.includes(category)) {
        setValidationError(
          `Запчасть «${part.name}» не совместима с категорией ${VEHICLE_CATEGORY_LABELS[category] ?? category}`
        );
        return;
      }
    }

    setSelectedPartIds((prev) =>
      isAdding ? [...prev, partId] : prev.filter((id) => id !== partId)
    );
    setValidationError('');
  };

  const calculateTotal = () => {
    if (!selectedVehicle) return 0;
    const partsTotal = allParts
      .filter((p) => selectedPartIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    return selectedVehicle.price + partsTotal;
  };

  const resetConfigurator = async () => {
    if (vehicles.length === 0) return;
    const first = vehicles[0];
    setSelectedVehicle(first);
    setCustomerName('');
    setPhone('');
    await loadVehicleParts(first);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || validationError) return;

    setSubmitting(true);
    setValidationError('');

    try {
      const data = await createOrder({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        vehicle_id: selectedVehicle.id,
        selected_part_ids: selectedPartIds,
        total_price: calculateTotal(),
      });

      if (data.success) {
        setOrderSuccess(true);
        setOrderId(data.order_id);
        setShowModal(false);
        await resetConfigurator();
      }
    } catch (err) {
      setValidationError(err.message || 'Ошибка при оформлении заказа');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      <div className="mb-10 text-center">
        <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm mb-2">Сборка под ключ</h2>
        <h3 className="text-4xl md:text-5xl font-black uppercase italic">Конфигуратор мототехники</h3>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Выбор мотоцикла */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Модель</h4>
            <select
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none mb-6"
              onChange={(e) => handleVehicleSelect(e.target.value)}
              value={selectedVehicle?.id ?? ''}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {selectedVehicle && (
              <div className="overflow-hidden border border-white/10">
                <img
                  src={selectedVehicle.image}
                  alt={selectedVehicle.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 bg-black/30">
                  <h5 className="text-xl font-black uppercase italic mb-2">{selectedVehicle.name}</h5>
                  <p className="text-gray-400 text-sm mb-3">{selectedVehicle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-gray-400">
                      {VEHICLE_CATEGORY_LABELS[selectedVehicle.category] ?? selectedVehicle.category}
                    </span>
                    <span className="text-accent font-black">{formatPrice(selectedVehicle.price)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Запчасти */}
          <div className="lg:col-span-5">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">
              Компоненты и тюнинг
            </h4>

            {loadingParts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="space-y-6 max-h-[520px] overflow-y-auto pr-1">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-accent" />
                    <h5 className="text-sm font-bold uppercase tracking-wider">Стоковая комплектация</h5>
                  </div>
                  <div className="space-y-2">
                    {stockParts.length === 0 ? (
                      <p className="text-gray-500 text-sm">Стоковые детали не найдены</p>
                    ) : (
                      stockParts.map((part) => (
                        <PartRow
                          key={part.id}
                          part={part}
                          checked={selectedPartIds.includes(part.id)}
                          onToggle={handlePartToggle}
                          badge="Сток"
                        />
                      ))
                    )}
                  </div>
                </section>

                {tuningParts.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <h5 className="text-sm font-bold uppercase tracking-wider">Альтернативный тюнинг</h5>
                    </div>
                    <div className="space-y-2">
                      {tuningParts.map((part) => (
                        <PartRow
                          key={part.id}
                          part={part}
                          checked={selectedPartIds.includes(part.id)}
                          onToggle={handlePartToggle}
                          badge="Тюнинг"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Итог */}
          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Итого</h4>
            <div className="text-4xl font-black text-accent mb-6">{formatPrice(calculateTotal())}</div>

            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Мотоцикл</span>
                <span>{selectedVehicle ? formatPrice(selectedVehicle.price) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Запчасти ({selectedPartIds.length})</span>
                <span>
                  {formatPrice(
                    allParts
                      .filter((p) => selectedPartIds.includes(p.id))
                      .reduce((sum, p) => sum + p.price, 0)
                  )}
                </span>
              </div>
            </div>

            {validationError && (
              <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
                {validationError}
              </div>
            )}

            {orderSuccess && (
              <div className="mb-4 p-4 border border-green-500/50 bg-green-500/10 text-green-400 text-sm flex gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Заказ успешно оформлен!</p>
                  <p>
                    Номер вашего заказа: <strong className="text-white">{orderId}</strong>
                  </p>
                </div>
              </div>
            )}

            <button
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!selectedVehicle || !!validationError || loadingParts || selectedPartIds.length === 0}
              onClick={() => setShowModal(true)}
            >
              <span className="block skew-x-[12deg]">Оформить заказ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={() => !submitting && setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h5 className="text-2xl font-black uppercase italic mb-6">Оформление заказа</h5>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-3 border border-white/10 hover:border-white/30 transition-colors uppercase text-sm tracking-wider"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 disabled:opacity-40"
                  disabled={submitting}
                >
                  <span className="block skew-x-[12deg] flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Подтвердить
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotoConfigurator;
