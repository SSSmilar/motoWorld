import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Wrench, Sparkles, Loader2, ShoppingCart } from 'lucide-react';
import PartCategoryIcon from './PartCategoryIcon';
import {
  fetchProducts,
  fetchStockParts,
  fetchCompatibleTuning,
  formatPrice,
} from '../services/configuratorService';
import { formatPriceDeltaLabel } from '../utils/priceFormat';
import {
  calculateBuildPrice,
  computePartPriceDelta,
  getActivePartsByCategory,
  isEssentialPartCategory,
  isPartCompatibleWithVehicle,
  normalizeProduct,
  resolveProductImage,
} from '../utils/productUtils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import VehicleImage from './VehicleImage';

function PartRow({ part, isSelected, onSelect, badge, priceDelta }) {
  const { label: deltaLabel, className: deltaClass } = formatPriceDeltaLabel(priceDelta, isSelected);

  return (
    <label
      className={`flex items-stretch gap-3 p-3 border cursor-pointer transition-colors ${
        isSelected ? 'border-accent/50 bg-accent/5' : 'border-white/10 bg-black/30 hover:border-accent/30'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(part.id)}
        className="w-4 h-4 accent-accent shrink-0 mt-1 rounded-sm"
      />
      <PartCategoryIcon category={part.category} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium">{part.name}</span>
          {badge && (
            <span className="text-[10px] uppercase px-1.5 py-0.5 bg-accent/20 text-accent font-bold">
              {badge}
            </span>
          )}
        </div>
        <div className="flex gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
          <span>{part.category}</span>
          {part.brand && <span>· {part.brand}</span>}
        </div>
      </div>
      <span className={`text-sm font-bold shrink-0 self-center ${deltaClass}`}>
        {deltaLabel}
      </span>
    </label>
  );
}

const MotoConfigurator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCustomBuild, openCart } = useCart();

  const [vehicles, setVehicles] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stockParts, setStockParts] = useState([]);
  const [stockPartIds, setStockPartIds] = useState([]);
  const [tuningParts, setTuningParts] = useState([]);
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingParts, setLoadingParts] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const stockByCategory = useMemo(
    () => Object.fromEntries(stockParts.map((p) => [p.category, p])),
    [stockParts]
  );

  const loadVehicleParts = useCallback(async (vehicle) => {
    if (!vehicle) return;
    setLoadingParts(true);
    setValidationError('');
    setAddedToCart(false);

    try {
      const [stock, tuning] = await Promise.all([
        fetchStockParts(vehicle.id),
        fetchCompatibleTuning(vehicle.id),
      ]);
      const ids = stock.map((p) => p.id);
      setStockParts(stock);
      setStockPartIds(ids);
      setTuningParts(tuning);
      setSelectedPartIds(ids);
    } catch (err) {
      setValidationError(err.message || 'Не удалось загрузить запчасти');
      setStockParts([]);
      setStockPartIds([]);
      setTuningParts([]);
      setSelectedPartIds([]);
    } finally {
      setLoadingParts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        const v = data.filter((p) => p.type === 'vehicle').map(normalizeProduct);
        const p = data.filter((pt) => pt.type === 'part');
        setVehicles(v);
        setAllParts(p);

        const fromUrl = searchParams.get('vehicle');
        const initial = fromUrl
          ? v.find((veh) => veh.id == fromUrl) ?? v[0]
          : v[0];

        if (initial) {
          setSelectedVehicle(initial);
          loadVehicleParts(initial);
        }
      })
      .catch((err) => setValidationError(err.message || 'Не удалось загрузить каталог'))
      .finally(() => setLoading(false));
  }, [loadVehicleParts, searchParams]);

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === Number(vehicleId));
    if (!vehicle) return;
    setSelectedVehicle(vehicle);
    loadVehicleParts(vehicle);
  };

  const replaceCategorySelection = (prev, part) => {
    const sameCategoryIds = allParts
      .filter((p) => p.category === part.category && p.id !== part.id)
      .map((p) => p.id);
    return [...prev.filter((id) => !sameCategoryIds.includes(id)), part.id];
  };

  const revertEssentialCategoryToStock = (prev, category) => {
    const stockPart = stockByCategory[category];
    if (!stockPart) return prev;

    const sameCategoryIds = allParts
      .filter((p) => p.category === category)
      .map((p) => p.id);
    return [...prev.filter((id) => !sameCategoryIds.includes(id)), stockPart.id];
  };

  const handlePartSelect = (partId) => {
    const part = allParts.find((p) => p.id === partId);
    if (!part || !selectedVehicle) return;

    if (!isPartCompatibleWithVehicle(part, selectedVehicle)) {
      setValidationError(
        `Запчасть «${part.name}» не совместима с типом «${selectedVehicle.category}»`
      );
      return;
    }

    const essential = isEssentialPartCategory(part.category);

    setSelectedPartIds((prev) => {
      const active = getActivePartsByCategory(allParts, prev, stockPartIds);
      const isCurrentlySelected = active[part.category]?.id === part.id;

      if (essential) {
        if (isCurrentlySelected) {
          if (stockPartIds.includes(partId)) return prev;
          return revertEssentialCategoryToStock(prev, part.category);
        }
        return replaceCategorySelection(prev, part);
      }

      const isAdding = !prev.includes(partId);
      if (isAdding) return replaceCategorySelection(prev, part);

      return prev.filter((id) => id !== partId);
    });
    setValidationError('');
  };

  const priceBreakdown = useMemo(() => {
    if (!selectedVehicle) {
      return {
        partsTotal: 0,
        stockTotal: 0,
        partsDelta: 0,
        catalogPrice: 0,
        total: 0,
        resolvedParts: [],
      };
    }
    return calculateBuildPrice(selectedVehicle, selectedPartIds, allParts, stockPartIds);
  }, [selectedVehicle, selectedPartIds, allParts, stockPartIds]);

  const activeByCategory = useMemo(
    () => getActivePartsByCategory(allParts, selectedPartIds, stockPartIds),
    [allParts, selectedPartIds, stockPartIds]
  );

  const getPartPriceDelta = (part) => computePartPriceDelta(part, activeByCategory);

  const isPartActiveInCategory = (part) => activeByCategory[part.category]?.id === part.id;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedVehicle || validationError || priceBreakdown.resolvedParts.length === 0) return;

    const { resolvedParts, total } = priceBreakdown;

    addCustomBuild({
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      vehicleImage: resolveProductImage(selectedVehicle) ?? selectedVehicle.image,
      selectedPartIds: resolvedParts.map((p) => p.id),
      partNames: resolvedParts.map((p) => p.name),
      price: total,
    });

    setAddedToCart(true);
    openCart();
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
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Модель</h4>
            <select
              className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-accent outline-none mb-6"
              onChange={(e) => handleVehicleSelect(e.target.value)}
              value={selectedVehicle?.id ?? ''}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            {selectedVehicle && (
              <div className="overflow-hidden border border-white/10">
                <VehicleImage
                  src={selectedVehicle.imageUrl ?? selectedVehicle.image}
                  alt={selectedVehicle.name}
                  hover={false}
                />
                <div className="p-4 bg-black/30">
                  <h5 className="text-xl font-black uppercase italic mb-2">{selectedVehicle.name}</h5>
                  <p className="text-gray-400 text-sm mb-3">{selectedVehicle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-gray-400">
                      {selectedVehicle.category}
                    </span>
                    <span className="text-accent font-black">
                      {formatPrice(priceBreakdown.catalogPrice || selectedVehicle.price)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Компоненты и тюнинг</h4>

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
                    {stockParts.map((part) => (
                      <PartRow
                        key={part.id}
                        part={part}
                        isSelected={isPartActiveInCategory(part)}
                        onSelect={handlePartSelect}
                        badge="Сток"
                        priceDelta={getPartPriceDelta(part)}
                      />
                    ))}
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
                          isSelected={isPartActiveInCategory(part)}
                          onSelect={handlePartSelect}
                          badge="Тюнинг"
                          priceDelta={getPartPriceDelta(part)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Итого</h4>
            <div className="text-4xl font-black text-accent mb-6">{formatPrice(priceBreakdown.total)}</div>

            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Базовая сборка (со стоком)</span>
                <span>
                  {selectedVehicle ? formatPrice(priceBreakdown.catalogPrice || selectedVehicle.price) : '—'}
                </span>
              </div>
              {priceBreakdown.partsDelta !== 0 && (
                <div className="flex justify-between">
                  <span>Изменения от стока</span>
                  <span className={priceBreakdown.partsDelta > 0 ? 'text-accent' : 'text-green-400'}>
                    {priceBreakdown.partsDelta > 0 ? '+' : '−'}
                    {formatPrice(Math.abs(priceBreakdown.partsDelta))}
                  </span>
                </div>
              )}
            </div>

            {validationError && (
              <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">{validationError}</div>
            )}

            {addedToCart && (
              <div className="mb-4 p-4 border border-green-500/50 bg-green-500/10 text-green-400 text-sm flex gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Сборка добавлена в корзину!</p>
                  <button onClick={() => navigate('/cart')} className="underline text-white mt-1 text-xs">
                    Перейти к оформлению →
                  </button>
                </div>
              </div>
            )}

            <button
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed mb-3"
              disabled={!selectedVehicle || !!validationError || loadingParts || priceBreakdown.resolvedParts.length === 0}
              onClick={handleAddToCart}
            >
              <span className="block skew-x-[12deg] flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> В корзину
              </span>
            </button>

            <button
              className="w-full py-3 border border-white/10 text-gray-400 text-xs uppercase tracking-wider hover:border-accent/50 hover:text-white transition-colors"
              onClick={() => navigate('/cart')}
            >
              Перейти в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotoConfigurator;
