const {resolve} = require('path');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const commonConfig = require('./webpack.config.common');



module.exports = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new UglifyJsPlugin({
      parallel: true,
      extractComments: true
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      hash: true,
      inject: true,
      inlineSource: 'runtime~.+\\.(js|css)',
      template: resolve(__dirname, '..', 'src', 'index.html'),
      filename: 'server.html',
      //favicon: resolve(__dirname, '..', 'src', 'client', 'static', 'favicon.png'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      inline: 'runtime',
      preload: /\.(js|css)$/
    }),
    //new HtmlWebpackInlineSourcePlugin(),
    new ManifestPlugin({
      fileName: 'my-manifest.json',
      writeToFileEmit: true,
      seed: {
        map: function(file) {
          file.name = path.join(path.dirname(file.path), file.name);
          console.log("\n\n fileee-->",file.name,file);
          return file;
        }
      }

    })
  ]
});
