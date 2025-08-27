const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const commonConfig = {
    entry: {
      cookiedialog: './src/index.ts'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    },
    plugins: [
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'cookiedialog.min.css'
        })
      ] : [])
    ]
  };

  // UMD build (for CDN)
  const umdConfig = {
    ...commonConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].min.js' : '[name].js',
      library: {
        name: 'CookieDialog',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    plugins: [
      ...commonConfig.plugins,
      new HtmlWebpackPlugin({
        template: './demo/index.html',
        filename: '../demo/demo.html',
        inject: 'head'
      })
    ]
  };

  // ESM build
  const esmConfig = {
    ...commonConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].esm.js',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    }
  };

  // Return array of configs for multiple builds
  if (isProduction) {
    return [umdConfig, esmConfig];
  }
  
  return umdConfig;
};