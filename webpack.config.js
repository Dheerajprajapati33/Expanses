const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Compile modern JS/ES6 code in specific node_modules that distribute uncompiled code
const compileNodeModules = [
  'react-native-vector-icons',
  'react-native-chart-kit',
  'react-native-svg',
  'react-native-paper',
  '@react-navigation',
  'react-native-screens',
  'react-native-safe-area-context',
].map(moduleName => path.resolve(__dirname, `node_modules/${moduleName}`));

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.web.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: (modulePath) => {
          if (!/node_modules/.test(modulePath)) {
            return false;
          }
          const includeLibs = [
            'react-native-vector-icons',
            'react-native-chart-kit',
            'react-native-svg',
            'react-native-paper',
            '@react-navigation',
            'react-native-screens',
            'react-native-safe-area-context',
            '@react-native-async-storage'
          ];
          const shouldCompile = includeLibs.some(lib => modulePath.includes(lib));
          return !shouldCompile;
        },
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', { modules: false }],
              '@babel/preset-react'
            ],
            plugins: ['react-native-web']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web'
    },
    extensions: ['.web.js', '.js', '.jsx', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html'
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /@expo\/vector-icons|@react-native-vector-icons\/material-design-icons/
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 8080,
    hot: true,
    open: true
  }
};
