/**
 * Скачивает изображения мотоциклов и запчастей в public/images/
 * и обновляет поле image в server/database.json.
 *
 * Запуск: node scripts/download_all_media.js
 *        npm run download-media
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'server/database.json');
const IMAGES_DIR = path.join(ROOT, 'public/images');

/** Мотоциклы: id → { filename, urls[] (fallback chain) } */
const VEHICLE_MEDIA = {
  1: { filename: 'ducati_panigale_v4.jpg', urls: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=90&w=1400'] },
  2: { filename: 'harley_fatboy.jpg', urls: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=90&w=1400'] },
  3: { filename: 'bmw_r1250gs.jpg', urls: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=90&w=1400'] },
  4: { filename: 'yamaha_mt09.jpg', urls: ['https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?auto=format&fit=crop&q=90&w=1400'] },
  5: { filename: 'kayo_evolution.jpg', urls: ['https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=90&w=1400'] },
  6: { filename: 'ktm_450_sxf.jpg', urls: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=90&w=1400'] },
  7: { filename: 'honda_cbr600rr.jpg', urls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=90&w=1400'] },
  8: { filename: 'royal_enfield_classic350.jpg', urls: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=90&w=1400'] },
  9: { filename: 'beta_rr300.jpg', urls: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=90&w=1400'] },
};

/** Запчасти: id → filename (уникальное имя файла) */
const PART_FILENAMES = {
  101: 'carburetor_nibbi_pe19.jpg',
  116: 'carburetor_mikuni_vm26.jpg',
  117: 'carburetor_keihin_fcr39.jpg',
  118: 'fuel_controller_powercommander.jpg',
  119: 'carburetor_polini_24.jpg',
  102: 'chain_did_520.jpg',
  120: 'chain_rk_520xso.jpg',
  121: 'chain_ek_428.jpg',
  113: 'sprockets_jt_anodized.jpg',
  122: 'sprockets_afam_kit.jpg',
  123: 'sprockets_supersprox.jpg',
  106: 'handlebar_renthal_fatbar.jpg',
  124: 'handlebar_protaper.jpg',
  125: 'handlebar_rizoma.jpg',
  126: 'levers_asv_f3.jpg',
  127: 'handlebar_ape_hanger.jpg',
  104: 'exhaust_akrapovic_titanium.jpg',
  128: 'exhaust_fmf_powercore4.jpg',
  129: 'exhaust_arrow_prorace.jpg',
  130: 'exhaust_vance_hines.jpg',
  131: 'exhaust_yoshimura_rs9.jpg',
  132: 'exhaust_pro_circuit_t4.jpg',
  103: 'tires_pirelli_supercorsa.jpg',
  112: 'tires_continental_tkc80.jpg',
  133: 'tires_mitas_c19.jpg',
  134: 'tires_michelin_power_gp.jpg',
  135: 'tires_dunlop_roadsmart.jpg',
  136: 'tires_metzeler_me888.jpg',
  137: 'tires_kenda_k761.jpg',
  138: 'tires_bridgestone_s22.jpg',
  107: 'protection_barkbusters.jpg',
  139: 'protection_rg_engine.jpg',
  140: 'protection_sw_motech_skid.jpg',
  141: 'protection_puig_sliders.jpg',
  108: 'brakes_brembo_z04.jpg',
  142: 'brakes_ebc_hh.jpg',
  143: 'brakes_braking_stx.jpg',
  144: 'brakes_goodridge_hose.jpg',
  105: 'luggage_touratech_alu.jpg',
  145: 'luggage_givi_trekker.jpg',
  146: 'luggage_harley_saddlebag.jpg',
  109: 'body_puig_windscreen.jpg',
  147: 'body_givi_airflow.jpg',
  148: 'body_rg_radiator_guard.jpg',
  110: 'seat_mustang_touring.jpg',
  149: 'seat_sargent_worldsport.jpg',
  150: 'seat_corbin_gunfighter.jpg',
  111: 'lighting_daymaker_led.jpg',
  151: 'lighting_jw_speaker.jpg',
  152: 'lighting_rizoma_tail.jpg',
  114: 'footpegs_sw_motech.jpg',
  153: 'footpegs_pro_titanium.jpg',
  154: 'footpegs_mfw_vario.jpg',
  115: 'electronics_dynojet_quickshifter.jpg',
  155: 'electronics_rapid_bike.jpg',
  156: 'electronics_tpms_rideon.jpg',
  157: 'electronics_hm_quickshifter.jpg',
};

/** Тематические фото запчастей (Unsplash) + fallback picsum по id */
const PART_IMAGE_URLS = {
  'Карбюраторы': 'https://images.unsplash.com/photo-1625039129420-562693892534?auto=format&fit=crop&q=80&w=600',
  'Цепи и звезды': 'https://images.unsplash.com/photo-1591452107412-df4c62c3e60a?auto=format&fit=crop&q=80&w=600',
  'Рули': 'https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=600',
  'Выхлоп': 'https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=600',
  'Покрышки': 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=600',
  'Защита': 'https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=600',
  'Тормоза': 'https://images.unsplash.com/photo-1625039129420-562693892534?auto=format&fit=crop&q=80&w=600',
  'Багаж': 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=600',
  'Кузов': 'https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=600',
  'Сиденья': 'https://images.unsplash.com/photo-1558981420-c532902e58b4?auto=format&fit=crop&q=80&w=600',
  'Освещение': 'https://images.unsplash.com/photo-1625039129420-562693892534?auto=format&fit=crop&q=80&w=600',
  'Подножки': 'https://images.unsplash.com/photo-1625039129420-562693892534?auto=format&fit=crop&q=80&w=600',
  'Электроника': 'https://images.unsplash.com/photo-1625039129420-562693892534?auto=format&fit=crop&q=80&w=600',
};

function picsumFallback(id) {
  return `https://picsum.photos/seed/motoworld_part_${id}/600/400.jpg`;
}

async function downloadFromUrls(urls, dest) {
  let lastError;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'motoWorld-media-downloader/1.0' },
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1000) throw new Error('File too small');
      await fs.writeFile(dest, buffer);
      return buffer.length;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('All URLs failed');
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  const db = JSON.parse(raw);

  let ok = 0;
  let fail = 0;

  console.log('=== Мотоциклы ===\n');
  for (const product of db.products.filter((p) => p.type === 'vehicle')) {
    const meta = VEHICLE_MEDIA[product.id];
    if (!meta) {
      console.warn(`  ⚠ Нет маппинга: id=${product.id}`);
      fail++;
      continue;
    }
    const dest = path.join(IMAGES_DIR, meta.filename);
    try {
      const bytes = await downloadFromUrls([...meta.urls, picsumFallback(`v${product.id}`)], dest);
      product.image = meta.filename;
      console.log(`  ✓ ${meta.filename} (${(bytes / 1024).toFixed(0)} KB) — ${product.name}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${product.name}: ${err.message}`);
      product.image = meta.filename;
      fail++;
    }
  }

  console.log('\n=== Запчасти ===\n');
  for (const product of db.products.filter((p) => p.type === 'part')) {
    const filename = PART_FILENAMES[product.id];
    if (!filename) {
      console.warn(`  ⚠ Нет filename: id=${product.id}`);
      fail++;
      continue;
    }
    const categoryUrl = PART_IMAGE_URLS[product.category];
    const urls = [picsumFallback(product.id), categoryUrl].filter(Boolean);
    const dest = path.join(IMAGES_DIR, filename);
    try {
      const bytes = await downloadFromUrls(urls, dest);
      product.image = filename;
      console.log(`  ✓ ${filename} (${(bytes / 1024).toFixed(0)} KB) — ${product.name}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${product.name}: ${err.message}`);
      product.image = filename;
      fail++;
    }
  }

  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  const files = await fs.readdir(IMAGES_DIR);
  console.log(`\n✓ Готово: ${ok} успешно, ${fail} с ошибками`);
  console.log(`✓ Файлов в public/images: ${files.length}`);
  console.log('✓ database.json обновлён');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
