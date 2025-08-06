/**
 * Widget Management Routes
 * 埋め込みコード生成・管理機能
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 簡易的なウィジェット管理（実際の運用では永続化が必要）
const widgets = new Map();

/**
 * ウィジェット登録・埋め込みコード生成
 * POST /api/widget/register
 * Body: { domain: string, name?: string }
 */
router.post('/register', (req, res) => {
  try {
    const { domain, name } = req.body;

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain',
        message: 'ドメインが指定されていません。'
      });
    }

    // ウィジェットID生成
    const widgetId = uuidv4();
    
    // ウィジェット情報保存
    const widgetInfo = {
      id: widgetId,
      domain: domain.toLowerCase(),
      name: name || domain,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    widgets.set(widgetId, widgetInfo);

    // 埋め込みコード生成
    const embedCode = generateEmbedCode(widgetId);

    res.json({
      success: true,
      widget: widgetInfo,
      embedCode
    });

  } catch (error) {
    console.error('Widget registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Widget registration failed',
      message: 'ウィジェット登録に失敗しました。'
    });
  }
});

/**
 * ウィジェット情報取得
 * GET /api/widget/:widgetId
 */
router.get('/:widgetId', (req, res) => {
  try {
    const { widgetId } = req.params;
    
    const widget = widgets.get(widgetId);
    
    if (!widget) {
      return res.status(404).json({
        success: false,
        error: 'Widget not found',
        message: 'ウィジェットが見つかりません。'
      });
    }

    res.json({
      success: true,
      widget
    });

  } catch (error) {
    console.error('Widget fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Widget fetch failed',
      message: 'ウィジェット情報の取得に失敗しました。'
    });
  }
});

/**
 * ウィジェット一覧取得（管理用）
 * GET /api/widget
 */
router.get('/', (req, res) => {
  try {
    const widgetList = Array.from(widgets.values());
    
    res.json({
      success: true,
      widgets: widgetList,
      total: widgetList.length
    });

  } catch (error) {
    console.error('Widget list error:', error);
    res.status(500).json({
      success: false,
      error: 'Widget list fetch failed',
      message: 'ウィジェット一覧の取得に失敗しました。'
    });
  }
});

/**
 * 埋め込みコード生成関数
 * @param {string} widgetId - ウィジェットID
 * @returns {string} 埋め込み用HTMLコード
 */
function generateEmbedCode(widgetId) {
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000';

  return `<!-- Widget Translate - リアルタイム翻訳ウィジェット -->
<script>
  (function() {
    var widgetId = '${widgetId}';
    var apiUrl = '${serverUrl}/api';
    
    // ウィジェットスクリプト読み込み
    var script = document.createElement('script');
    script.src = '${serverUrl}/widget.js?id=' + widgetId;
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
    
    // ウィジェットCSS読み込み
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${serverUrl}/widget.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End Widget Translate -->`;
}

module.exports = router;
