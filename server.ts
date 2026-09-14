import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api';
import { initDatabase } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')));
app.use('/api', apiRouter);

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

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
