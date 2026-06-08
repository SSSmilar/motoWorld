import { Router } from 'express';
import {
  addOrder,
  findProductById,
  getAssemblyRule,
  getDb,
  saveToDisk,
} from './db.js';
import { isPartCompatible, validateConfiguration } from './compatibility.js';
import { calculateCustomBuildPrice, calculateOrderTotal } from './pricing.js';

const router = Router();

/** GET /api/products — все товары из памяти */
router.get('/products', (_req, res) => {
  res.json(getDb().products);
});

/** GET /api/products/:id — один товар */
router.get('/products/:id', (req, res) => {
  const product = findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  res.json(product);
});

/**
 * GET /api/vehicles/:id/parts
 * Стоковые запчасти мотоцикла по правилам сборки (assembly_rules).
 */
router.get('/vehicles/:id/parts', (req, res) => {
  const vehicle = findProductById(req.params.id);

  if (!vehicle || vehicle.type !== 'vehicle') {
    return res.status(404).json({ error: 'Мотоцикл не найден' });
  }

  const rule = getAssemblyRule(req.params.id);
  if (!rule) {
    return res.status(404).json({ error: 'Правила сборки для этого мотоцикла не найдены' });
  }

  const parts = rule.default_parts
    .map((partId) => findProductById(partId))
    .filter(Boolean);

  res.json(parts);
});

/** GET /api/vehicles/:id/price-preview — расчёт цены сборки на сервере */
router.post('/vehicles/:id/price-preview', (req, res) => {
  try {
    const { selected_part_ids } = req.body ?? {};
    if (!Array.isArray(selected_part_ids)) {
      return res.status(400).json({ error: 'Требуется selected_part_ids (массив)' });
    }

    const result = calculateCustomBuildPrice(req.params.id, selected_part_ids);
    const compatibility = validateConfiguration(result.vehicle, result.resolvedParts);
    if (!compatibility.valid) {
      return res.status(400).json({ error: compatibility.error });
    }

    res.json({
      vehicle_price: result.vehicle.price,
      parts_total: result.resolvedParts.reduce((s, p) => s + p.price, 0),
      total: result.total,
      resolved_part_ids: result.resolvedPartIds,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/validate-config
 * Body: { vehicle_id, selected_part_ids: number[] }
 */
router.post('/validate-config', (req, res) => {
  const { vehicle_id, selected_part_ids } = req.body ?? {};

  if (!vehicle_id || !Array.isArray(selected_part_ids)) {
    return res.status(400).json({
      valid: false,
      error: 'Требуются поля vehicle_id и selected_part_ids (массив)',
    });
  }

  const vehicle = findProductById(vehicle_id);
  if (!vehicle || vehicle.type !== 'vehicle') {
    return res.status(404).json({ valid: false, error: 'Мотоцикл не найден' });
  }

  try {
    const { resolvedParts } = calculateCustomBuildPrice(vehicle_id, selected_part_ids);
    const result = validateConfiguration(vehicle, resolvedParts);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ valid: false, error: err.message });
  }
});

/** GET /api/orders — список заказов (опционально ?user_id=) */
router.get('/orders', (req, res) => {
  const { user_id } = req.query;
  let orders = getDb().orders ?? [];

  if (user_id) {
    orders = orders.filter((o) => o.user_id == user_id);
  }

  res.json(orders);
});

/**
 * POST /api/orders
 * Body: { customer_name, phone, user_id?, items: CartItem[] }
 * items: { type: 'part', product_id, quantity } | { type: 'custom_build', vehicle_id, selected_part_ids, quantity }
 */
router.post('/orders', async (req, res) => {
  try {
    const { customer_name, phone, user_id, items } = req.body ?? {};

    if (!customer_name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Требуются customer_name, phone и непустой массив items',
      });
    }

    const { items: processedItems, total } = calculateOrderTotal(items);

    const order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customer_name,
      phone,
      user_id: user_id ?? null,
      items: processedItems,
      total_price: total,
      status: 'В обработке',
      created_at: new Date().toISOString(),
    };

    addOrder(order);
    await saveToDisk();

    res.status(201).json({ success: true, order_id: order.id, total });
  } catch (err) {
    console.error('[Orders]', err);
    res.status(400).json({ error: err.message || 'Не удалось сохранить заказ' });
  }
});

/** GET /api/vehicles/:id/compatible-parts — тюнинг, совместимый с мотоциклом */
router.get('/vehicles/:id/compatible-parts', (req, res) => {
  const vehicle = findProductById(req.params.id);

  if (!vehicle || vehicle.type !== 'vehicle') {
    return res.status(404).json({ error: 'Мотоцикл не найден' });
  }

  const rule = getAssemblyRule(req.params.id);
  const stockIds = new Set(rule?.default_parts ?? []);

  const tuningParts = getDb()
    .products
    .filter((p) => p.type === 'part' && !stockIds.has(p.id) && isPartCompatible(p, vehicle));

  res.json(tuningParts);
});

export default router;
