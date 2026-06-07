/**
 * Точка входа Express API для Vercel Serverless.
 * Все запросы /api/* перенаправляются сюда через rewrite в vercel.json.
 * Локально используется server/server.js (app.listen).
 */
import { createApp } from '../server/app.js';

const app = createApp();

export default app;
