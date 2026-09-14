import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api.ts';
import { initDatabase } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')));
app.use('/api', apiRouter);

// Serve static frontend in production if dist exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not Found');
    }
  });
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  initDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Genealogy production server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
