import { createApp, ensureDbLoaded } from './app.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await ensureDbLoaded();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[Server] MotoWorld API: http://localhost:${PORT}`);
    console.log(`[Server] In-Memory DB активна, персистентность через saveToDisk()`);
  });
}

start().catch((err) => {
  console.error('Не удалось запустить сервер:', err);
  process.exit(1);
});
