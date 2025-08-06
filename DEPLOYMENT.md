# Widget Translate デプロイメントガイド

## 🚀 クイックデプロイ

### 1. Vercel（推奨・最も簡単）

```bash
# 1. Vercel CLIインストール
npm install -g vercel

# 2. ログイン
vercel login

# 3. デプロイ
vercel

# 4. 環境変数設定
vercel env add GOOGLE_CLOUD_PROJECT_ID
vercel env add GOOGLE_APPLICATION_CREDENTIALS
vercel env add API_SECRET_KEY
```

**Google Cloud認証情報の設定**：
- Vercelダッシュボードで環境変数として`GOOGLE_APPLICATION_CREDENTIALS`にJSONの内容を直接貼り付け

### 2. Railway

```bash
# 1. Railway CLIインストール
npm install -g @railway/cli

# 2. ログイン・初期化
railway login
railway init

# 3. デプロイ
railway up

# 4. 環境変数設定
railway variables set GOOGLE_CLOUD_PROJECT_ID=transcription-461603
railway variables set API_SECRET_KEY=your-secret-key
```

### 3. Heroku

```bash
# 1. Heroku CLIインストール
npm install -g heroku

# 2. アプリ作成
heroku create your-widget-translate

# 3. 環境変数設定
heroku config:set GOOGLE_CLOUD_PROJECT_ID=transcription-461603
heroku config:set API_SECRET_KEY=your-secret-key
heroku config:set NODE_ENV=production

# 4. デプロイ
git push heroku main
```

## 🖥️ VPS・専用サーバー

### 必要な環境
- Node.js 18+
- PM2（プロセス管理）
- Nginx（リバースプロキシ）

### セットアップ手順

```bash
# 1. リポジトリクローン
git clone <your-repo-url>
cd widgetTranslate

# 2. 依存関係インストール
npm install

# 3. 本番用ビルド
npm run build

# 4. PM2でプロセス起動
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 5. Nginx設定（例）
sudo nano /etc/nginx/sites-available/widget-translate
```

### Nginx設定例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐳 Docker

```bash
# 1. イメージビルド
docker build -t widget-translate .

# 2. コンテナ実行
docker run -d \
  --name widget-translate \
  -p 3000:3000 \
  -e GOOGLE_CLOUD_PROJECT_ID=transcription-461603 \
  -e API_SECRET_KEY=your-secret-key \
  -e NODE_ENV=production \
  widget-translate
```

## 📋 デプロイ前チェックリスト

### 環境変数
- [ ] `GOOGLE_CLOUD_PROJECT_ID`
- [ ] `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] `API_SECRET_KEY`
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS`（本番ドメイン）

### セキュリティ
- [ ] Google Cloud Translation API有効化
- [ ] サービスアカウント権限確認
- [ ] CORS設定確認
- [ ] レート制限設定確認

### 動作確認
- [ ] `/health` エンドポイント応答確認
- [ ] `/api/translate/languages` API動作確認
- [ ] デモページ翻訳機能確認

## 🌐 埋め込みコード生成

デプロイ後、以下のAPIで埋め込みコードを生成：

```bash
curl -X POST https://your-domain.com/api/widget/register \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "name": "Example Site"}'
```

## 📊 監視・ログ

### PM2でのログ確認
```bash
pm2 logs widget-translate
pm2 monit
```

### ヘルスチェック
```bash
curl https://your-domain.com/health
```

## 🔧 トラブルシューティング

### よくある問題
1. **Google Cloud認証エラー**: サービスアカウントキーの設定確認
2. **CORS エラー**: `ALLOWED_ORIGINS`に本番ドメインを追加
3. **メモリ不足**: PM2設定で`max_memory_restart`を調整

### ログの確認場所
- PM2: `pm2 logs`
- Docker: `docker logs widget-translate`
- Vercel: Vercelダッシュボード
- Railway: Railwayダッシュボード
