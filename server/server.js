import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database
let db = {
  products: [],
  assembly_rules: [],
  orders: []
};

// 1. Архитектура In-Memory: При старте сервера читаем файл один раз
async function initDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    db = JSON.parse(data);
    console.log('Database loaded into memory');
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// 2. Персистентность: Асинхронная функция сохранения на диск
async function saveToDisk() {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('Database saved to disk');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// 3. Эндпоинты API

// GET /api/products — все товары из памяти
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

// GET /api/vehicles/:id/parts — стоковые запчасти для мотоцикла
app.get('/api/vehicles/:id/parts', (req, res) => {
  const { id } = req.params;
  const rule = db.assembly_rules.find(r => r.vehicle_id === id);
  
  if (!rule) {
    return res.status(404).json({ error: 'Vehicle not found or no assembly rules' });
  }

  const parts = db.products.filter(p => rule.default_parts.includes(p.id));
  res.json(parts);
});

// POST /api/validate-config — проверка совместимости по битовой маске
app.post('/api/validate-config', (req, res) => {
  const { vehicle_id, selected_part_ids } = req.body;
  
  const vehicle = db.products.find(p => p.id === vehicle_id && p.type === 'vehicle');
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const vehicleBit = vehicle.vehicle_type_bit;

  for (const partId of selected_part_ids) {
    const part = db.products.find(p => p.id === partId && p.type === 'part');
    if (!part) continue;

    /* 
       ЛОГИКА ПОБИТОВОЙ ПРОВЕРКИ:
       compatible_mask — это число, где каждый бит отвечает за тип техники.
       Например: 
       1 (01 в двоичной) — Питбайк
       2 (10 в двоичной) — Эндуро
       3 (11 в двоичной) — Совместим и с тем, и с другим.
       
       Операция (part.compatible_mask & vehicleBit) вернет ненулевое значение,
       если соответствующий бит установлен в маске детали.
    */
    if (!(part.compatible_mask & vehicleBit)) {
      return res.json({ 
        valid: false, 
        error: `Ошибка: ${part.name} не совместим с типом техники ${vehicle.name}!` 
      });
    }
  }

  res.json({ valid: true });
});

// POST /api/orders — сохранение заказа
app.post('/api/orders', async (req, res) => {
  const order = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  await saveToDisk();
  
  res.status(201).json(order);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});
