var path = require('path');
var webpack = require('webpack');

var BUILD_DIR = path.resolve(__dirname, 'public/bin');
var JSX_DIR = path.resolve(__dirname, 'public/jsx');
var APP_ENTRY = JSX_DIR + '/main.jsx';

var config = {
  entry: {
    app: APP_ENTRY,
  },
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        include: JSX_DIR,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: JSX_DIR,
    modulesDirectories: ['node_modules']
  }
};

module.exports = config;
