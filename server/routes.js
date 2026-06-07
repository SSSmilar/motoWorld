import { Router } from 'express';
import {
  addOrder,
  findProductById,
  getAssemblyRule,
  getDb,
  saveToDisk,
} from './db.js';
import { isPartCompatible, validateConfiguration } from './compatibility.js';

const router = Router();

/** GET /api/products — все товары из памяти */
router.get('/products', (_req, res) => {
  res.json(getDb().products);
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

/**
 * POST /api/validate-config
 * Body: { vehicle_id, selected_part_ids: string[] }
 * Побитовая проверка каждой выбранной детали.
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

  const selectedParts = selected_part_ids
    .map((id) => findProductById(id))
    .filter(Boolean);

  if (selectedParts.length !== selected_part_ids.length) {
    return res.status(400).json({ valid: false, error: 'Одна или несколько запчастей не найдены' });
  }

  const result = validateConfiguration(vehicle, selectedParts);
  return res.json(result);
});

/**
 * POST /api/orders
 * Сохраняет заказ в память и вызывает saveToDisk().
 */
router.post('/orders', async (req, res) => {
  try {
    const { vehicle_id, selected_part_ids, customer_name, phone, total_price } = req.body ?? {};

    if (!vehicle_id || !Array.isArray(selected_part_ids) || !customer_name || !phone) {
      return res.status(400).json({ error: 'Требуются customer_name, phone, vehicle_id и selected_part_ids' });
    }

    const vehicle = findProductById(vehicle_id);
    if (!vehicle || vehicle.type !== 'vehicle') {
      return res.status(404).json({ error: 'Мотоцикл не найден' });
    }

    const selectedParts = selected_part_ids
      .map((id) => findProductById(id))
      .filter(Boolean);

    if (selectedParts.length !== selected_part_ids.length) {
      return res.status(400).json({ error: 'Одна или несколько запчастей не найдены' });
    }

    // Валидация: все запчасти должны быть совместимы с категорией мотоцикла
    for (const part of selectedParts) {
      if (!part.compatible_with || !part.compatible_with.includes(vehicle.category)) {
        return res.status(400).json({
          error: `Запчасть ${part.name} не совместима с категорией ${vehicle.category}`
        });
      }
    }

    const order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customer_name,
      phone,
      vehicle_id,
      selected_part_ids,
      total_price,
      created_at: new Date().toISOString(),
    };

    addOrder(order);
    await saveToDisk();

    res.status(201).json({ success: true, order_id: order.id });
  } catch (err) {
    console.error('[Orders]', err);
    res.status(500).json({ error: 'Не удалось сохранить заказ' });
  }
});

/** Дополнительный эндпоинт: список тюнинг-запчастей, совместимых с мотоциклом */
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
