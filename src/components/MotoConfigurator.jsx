import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Settings2, Wrench } from 'lucide-react';
import {
  createOrder,
  fetchProducts,
  fetchStockParts,
  formatPrice,
  validateConfig,
} from '../services/configuratorService';

/**
 * Интерактивный конфигуратор мототехники.
 * Слева — карточка мотоцикла, по центру — стоковые и тюнинг-запчасти с побитовой валидацией.
 */
const MotoConfigurator = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [stockParts, setStockParts] = useState([]);
  const [tuningParts, setTuningParts] = useState([]);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [validation, setValidation] = useState({ valid: true, error: null });
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  const allDisplayedParts = useMemo(
    () => [...stockParts, ...tuningParts],
    [stockParts, tuningParts],
  );

  const totalPrice = useMemo(() => {
    if (!selectedVehicle) return 0;
    const partsSum = allDisplayedParts
      .filter((p) => selectedPartIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    return selectedVehicle.price + partsSum;
  }, [selectedVehicle, allDisplayedParts, selectedPartIds]);

  const runValidation = useCallback(async (vehicleId, partIds) => {
    if (!vehicleId || partIds.length === 0) {
      setValidation({ valid: false, error: 'Выберите хотя бы одну запчасть' });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateConfig(vehicleId, partIds);
      setValidation(result);
    } catch (err) {
      setValidation({ valid: false, error: err.message });
    } finally {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const products = await fetchProducts();
        const vehicleList = products.filter((p) => p.type === 'vehicle');
        setVehicles(vehicleList);
        if (vehicleList.length > 0) {
          setSelectedVehicleId(vehicleList[0].id);
        }
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) return;

    (async () => {
      setOrderSuccess(null);
      try {
        const [products, stock] = await Promise.all([
          fetchProducts(),
          fetchStockParts(selectedVehicleId),
        ]);
        setStockParts(stock);
        const stockIds = new Set(stock.map((p) => p.id));
        const tuning = products.filter((p) => p.type === 'part' && !stockIds.has(p.id));
        setTuningParts(tuning);
        const defaultIds = stock.map((p) => p.id);
        setSelectedPartIds(defaultIds);
        await runValidation(selectedVehicleId, defaultIds);
      } catch (err) {
        setValidation({ valid: false, error: err.message });
      }
    })();
  }, [selectedVehicleId, runValidation]);

  const handlePartToggle = async (partId, checked) => {
    const nextIds = checked
      ? [...selectedPartIds, partId]
      : selectedPartIds.filter((id) => id !== partId);

    setSelectedPartIds(nextIds);
    await runValidation(selectedVehicleId, nextIds);
  };

  const handleCategoryReplace = async (category, newPartId) => {
    const categoryPartIds = new Set(
      allDisplayedParts.filter((p) => p.category === category).map((p) => p.id),
    );

    const nextIds = [
      ...selectedPartIds.filter((id) => !categoryPartIds.has(id)),
      newPartId,
    ];

    setSelectedPartIds(nextIds);
    await runValidation(selectedVehicleId, nextIds);
  };

  const handleSubmitOrder = async () => {
    if (!validation.valid || !selectedVehicle) return;

    setIsSubmitting(true);
    setOrderSuccess(null);

    try {
      const result = await createOrder({
        vehicle_id: selectedVehicleId,
        selected_part_ids: selectedPartIds,
        total_price: totalPrice,
      });
      setOrderSuccess(result.order);
    } catch (err) {
      setValidation({ valid: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400">
        Загрузка конфигуратора...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 glass-card rounded-xl border-red-500/40 text-red-400">
        <AlertTriangle className="inline mr-2" size={20} />
        Не удалось загрузить данные: {loadError}. Убедитесь, что API-сервер запущен.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings2 className="text-accent" size={28} />
          <h1 className="text-3xl font-black uppercase italic tracking-tight">
            Конфигуратор <span className="text-accent">мототехники</span>
          </h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Выберите мотоцикл, настройте комплектацию и проверьте совместимость запчастей
          через модуль побитовой маски совместимости.
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="vehicle-select" className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
          Мотоцикл
        </label>
        <select
          id="vehicle-select"
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="w-full md:w-auto bg-card-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent outline-none"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {formatPrice(v.price)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Левая колонка: карточка мотоцикла */}
        <aside className="lg:col-span-4">
          {selectedVehicle && (
            <article className="glass-card rounded-xl overflow-hidden sticky top-24">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  {selectedVehicle.vehicle_type_name}
                </span>
                <h2 className="text-2xl font-black mt-1 mb-3">{selectedVehicle.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {selectedVehicle.description}
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Базовая цена</p>
                  <p className="text-3xl font-black text-accent">{formatPrice(selectedVehicle.price)}</p>
                </div>
                <div className="border-t border-white/10 mt-4 pt-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Итого с комплектацией</p>
                  <p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </article>
          )}
        </aside>

        {/* Центральная колонка: компоненты */}
        <section className="lg:col-span-8 space-y-6">
          <PartSection
            title="Базовая комплектация (сток)"
            icon={<Wrench size={18} />}
            parts={stockParts}
            selectedPartIds={selectedPartIds}
            onToggle={handlePartToggle}
            onReplace={handleCategoryReplace}
            allowUncheck={false}
          />

          <PartSection
            title="Доступный тюнинг"
            icon={<Settings2 size={18} />}
            parts={tuningParts}
            selectedPartIds={selectedPartIds}
            onToggle={handlePartToggle}
            onReplace={handleCategoryReplace}
            allowUncheck
          />

          {/* Блок валидации */}
          <div className="glass-card rounded-xl p-5">
            {isValidating ? (
              <p className="text-gray-400 text-sm">Проверка совместимости...</p>
            ) : validation.valid ? (
              <p className="text-green-400 flex items-center gap-2 font-medium">
                <CheckCircle2 size={20} />
                Конфигурация совместима — можно оформить заказ
              </p>
            ) : (
              <p className="text-red-400 flex items-start gap-2 font-medium" role="alert">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                {validation.error}
              </p>
            )}

            {orderSuccess && (
              <p className="text-green-400 mt-3 text-sm">
                Заказ #{orderSuccess.id} успешно сохранён в in-memory хранилище!
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={!validation.valid || isValidating || isSubmitting}
              className="btn-primary mt-5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent"
            >
              {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

function PartSection({ title, icon, parts, selectedPartIds, onToggle, onReplace, allowUncheck }) {
  if (parts.length === 0) return null;

  const grouped = parts.reduce((acc, part) => {
    const key = part.category || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(part);
    return acc;
  }, {});

  const categoryLabels = {
    carburetor: 'Карбюратор',
    chain: 'Приводная цепь',
    other: 'Прочее',
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide mb-4">
        {icon}
        {title}
      </h3>

      {Object.entries(grouped).map(([category, categoryParts]) => (
        <div key={category} className="mb-5 last:mb-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            {categoryLabels[category] ?? category}
          </p>
          <ul className="space-y-3">
            {categoryParts.map((part) => {
              const isSelected = selectedPartIds.includes(part.id);
              const hasSelectedInCategory = categoryParts.some((p) => selectedPartIds.includes(p.id));

              return (
                <li
                  key={part.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected ? 'border-accent/50 bg-accent/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`part-${part.id}`}
                    checked={isSelected}
                    disabled={!allowUncheck && isSelected && hasSelectedInCategory}
                    onChange={(e) => {
                      if (categoryParts.length > 1 && e.target.checked) {
                        onReplace(category, part.id);
                      } else {
                        onToggle(part.id, e.target.checked);
                      }
                    }}
                    className="mt-1 accent-accent w-4 h-4"
                  />
                  <label htmlFor={`part-${part.id}`} className="flex-1 cursor-pointer">
                    <span className="font-semibold block">{part.name}</span>
                    <span className="text-sm text-gray-400 block mt-0.5">{part.description}</span>
                    <span className="text-accent font-bold text-sm mt-1 inline-block">
                      {formatPrice(part.price)}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">
                      mask: 0b{(part.compatible_mask ?? 0).toString(2).padStart(3, '0')}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default MotoConfigurator;
