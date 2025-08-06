/**
 * Webpack Configuration for Widget Translate
 * クライアントサイドファイルのビルド設定
 */

const path = require('path');

module.exports = {
  entry: {
    widget: './client/widget.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production'
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false
};
