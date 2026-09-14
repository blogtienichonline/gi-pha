import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../server/api';
import { initDatabase } from '../server/db';

const app = express();

// 1. CORS headers FIRST - handle preflight requests immediately
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// 2. Safe request body parsing (prevent hanging if Vercel already consumed/parsed stream)
app.use((req, res, next) => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (_) {}
    }
    return next();
  }

  // Do not invoke stream body parser on methods without body or if stream already completed
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS' || req.readableEnded) {
    req.body = req.body || {};
    return next();
  }

  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      console.error('Body parser error:', err);
      return res.status(400).json({ success: false, message: 'Dữ liệu yêu cầu không hợp lệ' });
    }
    next();
  });
});

// 3. Normalize request URL for Vercel rewrites
app.use((req, _res, next) => {
  // If Vercel rewrote URL to /api, recover original request path
  if (req.url === '/' || req.url === '/api' || req.url.startsWith('/api?')) {
    const original =
      req.originalUrl ||
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-forwarded-uri'] as string);

    if (original && original !== '/' && original !== '/api') {
      req.url = original;
    }
  }
  next();
});

// 4. Database initialization on cold start (non-blocking with timeout)
let dbReady: Promise<void> | null = null;
app.use(async (_req, _res, next) => {
  try {
    if (!dbReady) {
      dbReady = initDatabase().catch((err) => {
        console.error('Database initialization error:', err);
        dbReady = null; // Allow retry on subsequent requests
      });
    }
    // Prevent serverless function timeout by racing with a 2.5s timer
    await Promise.race([
      dbReady,
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (err) {
    console.error('Database middleware error:', err);
  }
  next();
});

// Health check endpoint for testing deployment status
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Gia Phả Họ Phạm API đang hoạt động bình thường trên Vercel',
  });
});

// 5. Mount routes for both /api/* and /* (handling rewritten and direct paths)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 6. 404 Fallback for unhandled API routes (prevents request from hanging and timing out)
app.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: `Đường dẫn API không tồn tại: ${req.method} ${req.originalUrl || req.url}`,
    });
  }
});

// 7. Global error handler for uncaught serverless errors
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error in serverless:', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: err?.message || 'Lỗi xử lý yêu cầu máy chủ',
    });
  }
});

// Standard export for Vercel Serverless Function with Express
export default app;


