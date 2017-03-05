var path = require('path');
var webpack = require('webpack');

var BUILD_DIR = path.resolve(__dirname, 'public/bin');
var JSX_DIR = path.resolve(__dirname, 'jsx');
var APP_ENTRY = JSX_DIR + '/main.jsx';
var NODE_MODULES_DIR = path.resolve(__dirname, './node_modules');

var config = {
  devtool: 'eval',
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
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [NODE_MODULES_DIR]
      },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: JSX_DIR,
    modulesDirectories: ['node_modules']
  }
};

module.exports = config;
