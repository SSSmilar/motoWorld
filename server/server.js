import { createApp, ensureDbLoaded } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

ensureDbLoaded().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
