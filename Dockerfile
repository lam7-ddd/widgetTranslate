# Widget Translate Dockerfile
FROM node:18-alpine

# 作業ディレクトリ設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係インストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# ビルド実行
RUN npm run build

# ポート公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# アプリケーション起動
CMD ["npm", "start"]
