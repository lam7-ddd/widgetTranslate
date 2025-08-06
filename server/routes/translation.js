/**
 * Translation API Routes
 * Google Cloud Translation APIを使用した翻訳処理
 */

const express = require('express');
const { Translate } = require('@google-cloud/translate').v2;
const router = express.Router();

// Google Cloud Translation クライアント初期化
let translate;
try {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (typeof credentials === 'string') {
    // JSON文字列の場合はパース
    const credentialsObj = JSON.parse(credentials);
    translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentialsObj
    });
  } else {
    // ローカル開発環境（ファイルパス）
    translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }
} catch (error) {
  console.error('Google Cloud Translation client initialization failed:', error);
  translate = new Translate({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
}

/**
 * サポート言語一覧取得
 * GET /api/translate/languages
 */
router.get('/languages', async (req, res) => {
  try {
    const [languages] = await translate.getLanguages();
    
    // 主要言語のみフィルタリング
    const supportedLanguages = [
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Português' },
      { code: 'ru', name: 'Русский' }
    ];

    res.json({
      success: true,
      languages: supportedLanguages
    });
  } catch (error) {
    console.error('Languages fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages',
      message: 'サポート言語の取得に失敗しました。'
    });
  }
});

/**
 * テキスト翻訳
 * POST /api/translate/text
 * Body: { texts: string[], targetLanguage: string, sourceLanguage?: string }
 */
router.post('/text', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;

    // バリデーション
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid texts',
        message: '翻訳するテキストが指定されていません。'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target language',
        message: '翻訳先言語が指定されていません。'
      });
    }

    // 空文字列や空白のみのテキストを除外
    const validTexts = texts.filter(text => 
      typeof text === 'string' && text.trim().length > 0
    );

    if (validTexts.length === 0) {
      return res.json({
        success: true,
        translations: texts.map(() => '')
      });
    }

    // Google Cloud Translation API呼び出し
    const options = {
      to: targetLanguage,
      ...(sourceLanguage && { from: sourceLanguage })
    };

    const [translations] = await translate.translate(validTexts, options);
    
    // 結果を元の配列の順序に合わせて復元
    let translationIndex = 0;
    const results = texts.map(originalText => {
      if (typeof originalText === 'string' && originalText.trim().length > 0) {
        return Array.isArray(translations) 
          ? translations[translationIndex++] 
          : translations;
      }
      return originalText; // 空文字列はそのまま返す
    });

    res.json({
      success: true,
      translations: results,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      message: '翻訳処理に失敗しました。しばらく待ってから再試行してください。'
    });
  }
});

/**
 * 言語検出
 * POST /api/translate/detect
 * Body: { text: string }
 */
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid text',
        message: '検出するテキストが指定されていません。'
      });
    }

    const [detection] = await translate.detect(text);
    
    res.json({
      success: true,
      language: detection.language,
      confidence: detection.confidence
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection failed',
      message: '言語検出に失敗しました。'
    });
  }
});

module.exports = router;
