/**
 * Widget Translate Server
 * Google Cloud Translation APIを使用したリアルタイム翻訳サービス
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const translationRoutes = require('./routes/translation');
const widgetRoutes = require('./routes/widget');
const setupStaticFiles = require('./middleware/static');

const app = express();
const PORT = process.env.PORT || 3000;

// セキュリティミドルウェア（開発環境ではCSPを緩和）
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  // 開発環境ではインラインスクリプトを許可
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
}

// CORS設定
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// レート制限
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15分
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'レート制限に達しました。しばらく待ってから再試行してください。'
    });
  }
});

// JSONパーサー
app.use(express.json({ limit: '10mb' }));

// 静的ファイル配信設定
setupStaticFiles(app);

// ルート設定
app.use('/api/translate', translationRoutes);
app.use('/api/widget', widgetRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'サーバーエラーが発生しました。'
  });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'リクエストされたエンドポイントが見つかりません。'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Widget Translate Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
