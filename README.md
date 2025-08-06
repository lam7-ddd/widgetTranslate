# Widget Translate

リアルタイム翻訳ウィジェット - Google Cloud Translation APIを使用したJavaScript埋め込み型翻訳システム

## 概要

Widget Translateは、ウェブサイトに簡単に埋め込むことができるリアルタイム翻訳ウィジェットです。Google Cloud Translation APIを使用して、ページ上のテキストを瞬時に多言語に翻訳します。

## 主な機能

- 🌐 **リアルタイム翻訳**: ページ上のテキストを瞬時に翻訳
- 🎯 **多言語サポート**: 英語、中国語、韓国語、スペイン語など主要言語に対応
- 🔄 **動的コンテンツ対応**: MutationObserverによる新しいコンテンツの自動検出
- 💾 **キャッシュ機能**: 翻訳結果をローカルストレージにキャッシュしてパフォーマンス向上
- 🎨 **レスポンシブデザイン**: モバイルデバイスにも対応
- 🌙 **ダークモード対応**: システムの設定に応じて自動切り替え
- 🔒 **セキュア**: APIキーはバックエンドで管理

## プロジェクト構成

```
widgetTranslate/
├── server/                 # Node.js バックエンド
│   ├── index.js           # メインサーバーファイル
│   ├── routes/            # APIルート
│   │   ├── translation.js # 翻訳API
│   │   └── widget.js      # ウィジェット管理
│   └── middleware/        # ミドルウェア
│       └── static.js      # 静的ファイル配信
├── client/                # フロントエンド
│   ├── widget.js          # ウィジェットJavaScript
│   └── widget.css         # ウィジェットスタイル
├── public/                # ビルド済みファイル
├── test/                  # テスト・デモファイル
│   └── demo.html          # デモページ
└── package.json           # 依存関係
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、必要な値を設定してください：

```bash
cp .env.example .env
```

### 3. Google Cloud Translation API の設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Translation APIを有効化
3. サービスアカウントキーを作成してダウンロード
4. `.env`ファイルに設定を追加

### 4. サーバー起動

```bash
# 開発環境
npm run dev

# 本番環境
npm start
```

### 5. デモページの確認

ブラウザで `http://localhost:3000/test/demo.html` を開いてデモを確認できます。

## 使用方法

### ウィジェットの埋め込み

1. ウィジェット登録APIを呼び出してウィジェットIDを取得
2. 生成された埋め込みコードをウェブサイトに追加

```html
<!-- Widget Translate 埋め込みコード -->
<script>
  (function() {
    var widgetId = 'your-widget-id';
    var apiUrl = 'https://your-domain.com/api';
    
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js?id=' + widgetId;
    script.async = true;
    script.onload = function() {
      if (typeof WidgetTranslate !== 'undefined') {
        new WidgetTranslate({
          widgetId: widgetId,
          apiUrl: apiUrl
        });
      }
    };
    document.head.appendChild(script);
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://your-domain.com/widget.css';
    document.head.appendChild(link);
  })();
</script>
```

## API エンドポイント

### 翻訳API

- `GET /api/translate/languages` - サポート言語一覧取得
- `POST /api/translate/text` - テキスト翻訳
- `POST /api/translate/detect` - 言語検出

### ウィジェット管理API

- `POST /api/widget/register` - ウィジェット登録
- `GET /api/widget/:widgetId` - ウィジェット情報取得
- `GET /api/widget` - ウィジェット一覧取得

## 開発

### ビルド

```bash
# クライアントファイルのビルド
npm run build

# 開発モードでのウォッチビルド
npm run dev:client
```

### テスト

```bash
npm test
```

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesページでお知らせください。
