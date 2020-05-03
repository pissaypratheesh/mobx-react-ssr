const {resolve} = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var AssetsPlugin = require('assets-webpack-plugin')
var assetsPluginInstance = new AssetsPlugin({metadata: {version: 123}})
const isDev = process.env.NODE_ENV !== 'production';

//'polyfill':'babel-polyfill', //this is removed from entry
module.exports = {
  target: 'web',
  entry: { main:'./src/client.js'},
  output: {
    publicPath: '/',
    path: resolve(__dirname, '..', 'build'),
    filename: '[name].[hash].js',  //chunkhash
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[hash:8].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components|public\/)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'style-loader',
            options: {sourceMap: isDev}
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                localIdentName: isDev ? '[path]-[name]_[local]' : '[name]_[local]_[hash:5]', // [hash:base64]
                modules: true,
                sourceMap: isDev,
                minimize: !isDev
              }
            },
            {
              loader: 'postcss-loader',
              options: {sourceMap: isDev}
            }
          ]
        })
      },
/*      {
        test: /\.s?css$/,
        use: ExtractTextPlugin.extract({
          fallback: {
            loader: 'style-loader',
            options: {sourceMap: isDev}
          },
          use: [
            {
              loader: 'css-loader',
              options: {
                localIdentName: isDev ? '[path]-[name]_[local]' : '[name]_[local]_[hash:5]', // [hash:base64]
                modules: true,
                sourceMap: isDev,
                minimize: !isDev
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDev
              }
            },
            {
              loader: 'postcss-loader',
              options: {sourceMap: isDev}
            }
          ]
        })
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },*/
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'file-loader?limit=5000&name=imgs/[name].[hash:6].[ext]'
          }
        ]
      }
    ]
  },
  plugins: [
    assetsPluginInstance,
    //new BundleAnalyzerPlugin(),

/*
    new ExtractTextPlugin({
      filename: '[name].css',
      disable: isDev
    }),
*/
/*
    new ExtractTextPlugin("styles.css"),
*/
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ],
  resolve: {
    modules: [resolve(__dirname, '../src/'), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss', '.less']
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    }
  },
  stats: {
    assetsSort: '!size',
    children: false,
    chunks: true,
    colors: true,
    entrypoints: false,
    modules: false
  }
};
//chunks: 'all'

/*

    runtimeChunk: 'single',
    namedModules: true,
    namedChunks: true,
    chunkIds: 'named',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
*/