/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 */

import webpack from 'webpack';
import validate from 'webpack-validator';
import merge from 'webpack-merge';
import formatter from 'eslint-formatter-pretty';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;

export default validate(merge(baseConfig, {
  debug: true,

  devtool: 'inline-source-map',

  entry: {
    bundle: [
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      'babel-polyfill',
      './app/index'
    ],
    "capture-screen": [
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      'babel-polyfill',
      './app/views/windows/capture-screen'
    ]
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.global\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap'
        ]
      },

      {
        test: /^((?!\.global).)*\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
        ]
      },

      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader?importLoaders=1&sourceMap',
          'less-loader?strictMath&noIeCompat&sourceMap'
        ]
      }
    ]
  },

  eslint: {
    formatter
  },

  plugins: [
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
    // https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
    new webpack.NoErrorsPlugin(),

    // NODE_ENV should be production so that modules do not perform certain development checks
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer'
}));
