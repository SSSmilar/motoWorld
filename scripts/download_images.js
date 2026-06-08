/**
 * Скачивает фото мотоциклов в public/images/ и обновляет database.json.
 * Запуск: node scripts/download_images.js
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'server/database.json');
const IMAGES_DIR = path.join(ROOT, 'public/images');

/** filename -> URL источника (Unsplash, открытые фото мотоциклов) */
const VEHICLE_IMAGES = {
  1: {
    filename: 'ducati_panigale_v4.jpg',
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=85&w=1200',
  },
  2: {
    filename: 'harley_fatboy.jpg',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=85&w=1200',
  },
  3: {
    filename: 'bmw_r1250gs.jpg',
    url: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=85&w=1200',
  },
  4: {
    filename: 'yamaha_mt09.jpg',
    url: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?auto=format&fit=crop&q=85&w=1200',
  },
  5: {
    filename: 'kayo_evolution.jpg',
    url: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=85&w=1200',
  },
  6: {
    filename: 'ktm_450_sxf.jpg',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=85&w=1200',
  },
  7: {
    filename: 'honda_cbr600rr.jpg',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=85&w=1200',
  },
  8: {
    filename: 'royal_enfield_classic350.jpg',
    url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=85&w=1200',
  },
  9: {
    filename: 'beta_rr300.jpg',
    url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=85&w=1200',
  },
};

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'motoWorld-image-downloader/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buffer);
  return buffer.length;
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const raw = await fs.readFile(DB_PATH, 'utf-8');
  const db = JSON.parse(raw);

  console.log('Скачивание изображений мотоциклов...\n');

  for (const product of db.products) {
    if (product.type !== 'vehicle') continue;

    const meta = VEHICLE_IMAGES[product.id];
    if (!meta) {
      console.warn(`  ⚠ Нет маппинга для id=${product.id} (${product.name})`);
      continue;
    }

    const dest = path.join(IMAGES_DIR, meta.filename);
    try {
      const bytes = await downloadFile(meta.url, dest);
      product.image = meta.filename;
      console.log(`  ✓ ${meta.filename} (${(bytes / 1024).toFixed(0)} KB) — ${product.name}`);
    } catch (err) {
      console.error(`  ✗ ${product.name}: ${err.message}`);
      // fallback: оставить filename, фронт покажет broken image — retry with backup URL
      product.image = meta.filename;
    }
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('\n✓ database.json обновлён (поле image → локальные имена файлов)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
