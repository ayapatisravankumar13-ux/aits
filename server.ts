import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRoute } from './src/server/apiHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API route middleware
app.use(async (req, res, next) => {
  if (req.url.startsWith('/api/')) {
    const handled = await handleApiRoute(req, res);
    if (handled) return;
  }
  next();
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart College Assistant Backend running on http://0.0.0.0:${PORT}`);
});
