/**
 * Static File Serving Middleware
 * ウィジェットファイルの配信設定
 */

const express = require('express');
const path = require('path');

/**
 * 静的ファイル配信ミドルウェア設定
 * @param {express.Application} app - Expressアプリケーション
 */
function setupStaticFiles(app) {
  // 開発環境では client フォルダから直接配信
  if (process.env.NODE_ENV === 'development') {
    app.use('/widget.js', express.static(path.join(__dirname, '../../client/widget.js')));
    app.use('/widget.css', express.static(path.join(__dirname, '../../client/widget.css')));
  } else {
    // 本番環境では public フォルダから配信
    app.use('/widget.js', express.static(path.join(__dirname, '../../public/widget.js')));
    app.use('/widget.css', express.static(path.join(__dirname, '../../public/widget.css')));
  }

  // その他の静的ファイル
  app.use('/public', express.static(path.join(__dirname, '../../public')));
  
  // テスト・デモファイル配信
  app.use('/test', express.static(path.join(__dirname, '../../test')));
}

module.exports = setupStaticFiles;
