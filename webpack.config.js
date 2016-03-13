var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var merge = require('webpack-merge');
var Clean = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var autoprefixer = require('autoprefixer');

var TARGET = process.env.npm_lifecycle_event;
var BUILD_DIRNAME = !process.env.BUILDDIR ? 'build'
  : path.resolve(ROOT_PATH, process.env.BUILDDIR);

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, BUILD_DIRNAME);

process.env.BABEL_ENV = TARGET;

var exportConfig = null;

var common = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp('^' + name + '$'));
  },

  entry: {
    app: path.resolve(APP_PATH, 'index.js')
  },

  output: {
    path: BUILD_PATH,
    filename: '[name].js?'
  },

  resolve: {
    modulesDirectories: ['node_modules', './src'],
    extensions: ['', '.js', '.jsx'],
    // root: r,
    alias: {}
  },

  module: {
    noParse: [],
    loaders: [
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css', 'postcss'],
        include: APP_PATH
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      },
      {
        test: /\.png|jpg|jpeg|gif|svg$/,
        loader: "url?name=img/[name].[ext]&limit=10000",
        include: APP_PATH
      },
      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=image/svg+xml'}

    ]
  },

  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  postcss: function () {
      return [ autoprefixer({ browsers: ['last 2 versions'] })];
  }
};

if(TARGET === 'start' || !TARGET) {
  exportConfig = merge(common, {
    devtool: 'eval-source-map',

    devServer: {
      port: 8088,
      // contentBase: './demo',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      host: "0.0.0.0"
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'DEBUG': JSON.stringify('true')
      }),
      new HtmlwebpackPlugin({
        title: 'App',
        filename: "index.html",
        template: 'src/htmlTemplate/index.html',
        inject: true
      })
    ]
  });
}

if(TARGET === 'build' || TARGET === 'stats' ) {
  exportConfig = merge(common, {
    devtool: 'source-map',

    plugins: [
      new Clean([BUILD_DIRNAME]),
      new webpack.DefinePlugin({
        'process.env': {
          // This affects react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),

      new CopyWebpackPlugin([
        { from: 'instructions.json'}
      ], {})
    ]
  });
}

module.exports = exportConfig
