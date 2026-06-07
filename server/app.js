import express from 'express';
import cors from 'cors';
import { loadDatabase } from './db.js';
import routes from './routes.js';

let initPromise = null;

/** Инициализация in-memory БД (один раз на процесс) */
export function ensureDbLoaded() {
  if (!initPromise) {
    initPromise = loadDatabase();
  }
  return initPromise;
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(async (_req, _res, next) => {
    try {
      await ensureDbLoaded();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use('/api', routes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', storage: 'in-memory' });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  });

  return app;
}
