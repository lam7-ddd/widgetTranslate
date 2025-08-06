/**
 * Widget Translate Client
 * リアルタイム翻訳ウィジェットのフロントエンド実装
 */

class WidgetTranslate {
  /**
   * @param {Object} config - 設定オプション
   * @param {string} config.widgetId - ウィジェットID
   * @param {string} config.apiUrl - API URL
   */
  constructor(config) {
    this.widgetId = config.widgetId;
    this.apiUrl = config.apiUrl;
    this.currentLanguage = 'ja'; // デフォルト言語
    this.originalTexts = new Map(); // 元のテキストを保存
    this.cache = new Map(); // 翻訳キャッシュ
    this.isTranslating = false;
    this.mutationObserver = null;
    
    this.init();
  }

  /**
   * ウィジェット初期化
   */
  async init() {
    try {
      await this.createUI();
      await this.loadSupportedLanguages();
      this.setupMutationObserver();
      this.saveOriginalTexts();
      
      console.log('🌐 Widget Translate initialized successfully');
    } catch (error) {
      console.error('Widget Translate initialization failed:', error);
    }
  }

  /**
   * UI作成
   */
  async createUI() {
    // ウィジェットコンテナ作成
    const container = document.createElement('div');
    container.id = 'widget-translate-container';
    container.innerHTML = `
      <div class="widget-translate-selector">
        <button id="widget-translate-btn" class="translate-btn">
          <span class="translate-icon">🌐</span>
          <span class="translate-text">翻訳</span>
        </button>
        <div id="widget-translate-dropdown" class="translate-dropdown">
          <div class="dropdown-header">言語を選択</div>
          <div class="language-list" id="widget-language-list">
            <div class="loading">読み込み中...</div>
          </div>
        </div>
      </div>
    `;

    // ページに追加
    document.body.appendChild(container);

    // イベントリスナー設定
    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  setupEventListeners() {
    const btn = document.getElementById('widget-translate-btn');
    const dropdown = document.getElementById('widget-translate-dropdown');

    // ボタンクリックでドロップダウン表示/非表示
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // 外部クリックでドロップダウンを閉じる
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  /**
   * サポート言語読み込み
   */
  async loadSupportedLanguages() {
    try {
      const response = await fetch(`${this.apiUrl}/translate/languages`);
      const data = await response.json();

      if (data.success) {
        this.renderLanguageList(data.languages);
      } else {
        throw new Error(data.message || 'Failed to load languages');
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error);
      this.renderLanguageError();
    }
  }

  /**
   * 言語リスト表示
   */
  renderLanguageList(languages) {
    const listContainer = document.getElementById('widget-language-list');
    
    listContainer.innerHTML = languages.map(lang => `
      <div class="language-item ${lang.code === this.currentLanguage ? 'active' : ''}" 
           data-code="${lang.code}">
        ${lang.name}
      </div>
    `).join('');

    // 言語選択イベント
    listContainer.addEventListener('click', (e) => {
      const langItem = e.target.closest('.language-item');
      if (langItem) {
        const langCode = langItem.dataset.code;
        this.selectLanguage(langCode);
      }
    });
  }

  /**
   * 言語エラー表示
   */
  renderLanguageError() {
    const listContainer = document.getElementById('widget-language-list');
    listContainer.innerHTML = `
      <div class="error-message">
        言語の読み込みに失敗しました
        <button onclick="location.reload()" class="retry-btn">再試行</button>
      </div>
    `;
  }

  /**
   * 言語選択処理
   */
  async selectLanguage(langCode) {
    if (langCode === this.currentLanguage || this.isTranslating) {
      return;
    }

    // UI更新
    document.querySelectorAll('.language-item').forEach(item => {
      item.classList.toggle('active', item.dataset.code === langCode);
    });

    // ドロップダウンを閉じる
    document.getElementById('widget-translate-dropdown').classList.remove('show');

    // 翻訳実行
    if (langCode === 'ja') {
      // 日本語の場合は元のテキストに戻す
      this.restoreOriginalTexts();
    } else {
      await this.translatePage(langCode);
    }

    this.currentLanguage = langCode;
  }

  /**
   * ページ翻訳実行
   */
  async translatePage(targetLanguage) {
    if (this.isTranslating) return;

    this.isTranslating = true;
    this.showLoadingState();

    try {
      const textNodes = this.getTranslatableTextNodes();
      const texts = textNodes.map(node => node.textContent.trim()).filter(text => text.length > 0);

      if (texts.length === 0) {
        return;
      }

      // キャッシュチェック
      const cacheKey = `${targetLanguage}:${JSON.stringify(texts)}`;
      let translations;

      if (this.cache.has(cacheKey)) {
        translations = this.cache.get(cacheKey);
      } else {
        // API呼び出し
        const response = await fetch(`${this.apiUrl}/translate/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            texts,
            targetLanguage,
            sourceLanguage: 'ja'
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Translation failed');
        }

        translations = data.translations;
        this.cache.set(cacheKey, translations);
      }

      // テキスト置換
      this.replaceTexts(textNodes, translations);

    } catch (error) {
      console.error('Translation error:', error);
      this.showErrorMessage('翻訳に失敗しました。しばらく待ってから再試行してください。');
    } finally {
      this.isTranslating = false;
      this.hideLoadingState();
    }
  }

  /**
   * 翻訳可能なテキストノード取得
   */
  getTranslatableTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 翻訳対象外の要素をスキップ
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          const skipTags = ['script', 'style', 'code', 'pre', 'textarea', 'input'];
          if (skipTags.includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // ウィジェット自体をスキップ
          if (parent.closest('#widget-translate-container')) {
            return NodeFilter.FILTER_REJECT;
          }

          // 空白のみのテキストをスキップ
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  /**
   * 元のテキストを保存
   */
  saveOriginalTexts() {
    const textNodes = this.getTranslatableTextNodes();
    textNodes.forEach((node, index) => {
      this.originalTexts.set(index, node.textContent);
    });
  }

  /**
   * 元のテキストに復元
   */
  restoreOriginalTexts() {
    const textNodes = this.getTranslatableTextNodes();
    textNodes.forEach((node, index) => {
      if (this.originalTexts.has(index)) {
        node.textContent = this.originalTexts.get(index);
      }
    });
  }

  /**
   * テキスト置換
   */
  replaceTexts(textNodes, translations) {
    let translationIndex = 0;
    textNodes.forEach(node => {
      const originalText = node.textContent.trim();
      if (originalText.length > 0 && translationIndex < translations.length) {
        node.textContent = translations[translationIndex++];
      }
    });
  }

  /**
   * MutationObserver設定（動的コンテンツ対応）
   */
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      let hasNewText = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE || 
                (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim())) {
              hasNewText = true;
            }
          });
        }
      });

      if (hasNewText && this.currentLanguage !== 'ja') {
        // 新しいテキストが追加された場合、少し待ってから翻訳
        setTimeout(() => {
          this.translatePage(this.currentLanguage);
        }, 500);
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * ローディング状態表示
   */
  showLoadingState() {
    const btn = document.getElementById('widget-translate-btn');
    btn.classList.add('loading');
    btn.querySelector('.translate-text').textContent = '翻訳中...';
  }

  /**
   * ローディング状態非表示
   */
  hideLoadingState() {
    const btn = document.getElementById('widget-translate-btn');
    btn.classList.remove('loading');
    btn.querySelector('.translate-text').textContent = '翻訳';
  }

  /**
   * エラーメッセージ表示
   */
  showErrorMessage(message) {
    // 簡易的なエラー表示（実際の実装では適切なUIを作成）
    console.error(message);
    alert(message);
  }

  /**
   * ウィジェット破棄
   */
  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    const container = document.getElementById('widget-translate-container');
    if (container) {
      container.remove();
    }
  }
}

// グローバルに公開
window.WidgetTranslate = WidgetTranslate;
