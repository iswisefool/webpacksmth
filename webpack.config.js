/**
 * Webpack configuration.
 */

"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

const CopyPlugin = require("copy-webpack-plugin");
const DependencyExtractionWebpackPlugin = require("@wordpress/dependency-extraction-webpack-plugin");
const loader = require("sass-loader");
const {default: postcss} = require("postcss");

// JS Directory path.
const JS_DIR = path.resolve(__dirname, "src/js");
const IMG_DIR = path.resolve(__dirname, "src/img");
const BUILD_DIR = path.resolve(__dirname, "build");

const entry = {
  main: JS_DIR + "/main.js",
};

const output = {
  path: BUILD_DIR,
  filename: "js/[name].js",
  assetModuleFilename: "assets/[name][ext]",
};

/**
 * Note: argv.mode will return 'development' or 'production'.
 */
const plugins = (argv) => [
  new CircularDependencyPlugin({
    // exclude detection of files based on a RegExp
    exclude: /a\.js|node_modules/,
    // include specific files based on a RegExp
    include: /dir/,
    // add errors to webpack instead of warnings
    failOnError: true,
    // allow import cycles that include an asyncronous import,
    // e.g. via import(/* webpackMode: "weak" */ './file.js')
    allowAsyncCycles: false,
    // set the current working directory for displaying module paths
    cwd: process.cwd(),
  }),
  new CleanWebpackPlugin({
    cleanStaleWebpackAssets: "production" === argv.mode, // Automatically remove all unused webpack assets on rebuild, when set to true in production. ( https://www.npmjs.com/package/clean-webpack-plugin#options-and-defaults-optional )
  }),
  new MiniCssExtractPlugin({
    filename: "css/[name].css",
  }),
  new DependencyExtractionWebpackPlugin({
    outputFormat: "php",
    outputFilename: "assets",
    injectPolyfill: true,
    combineAssets: true,
  }),
];

const rules = [
  {
    test: /\.js$/,
    include: [JS_DIR],
    exclude: /node_modules/,
    use: "babel-loader",
  },

  {
    test: /\.(s[ac]ss|css)$/,
    exclude: /node_modules/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
      },
      {
        loader: "postcss-loader",
        options: {
          postcssOptions: {
            plugins: [require("postcss-preset-env")],
          },
        },
      },
      {
        loader: "sass-loader",
      },
    ],
  },
];

module.exports = (env, argv) => ({
  entry: entry,

  output: output,

  devtool: "source-map",

  module: {
    rules: rules,
  },

  optimization: {
    minimizer: [new CssMinimizerPlugin({})],
  },

  plugins: plugins(argv),
  externals: {
    "@wordpress/a11y": "wp.a11y",
    "@wordpress/components": "wp.components", // Not really a package.
    "@wordpress/blocks": "wp.blocks", // Not really a package.
    "@wordpress/data": "wp.data", // Not really a package.
    "@wordpress/date": "wp.date", // Not really a package.
    "@wordpress/element": "wp.element", // Not really a package.
    "@wordpress/hooks": "wp.hooks",
    "@wordpress/i18n": "wp.i18n",
    "@wordpress/utils": "wp.utils", // Not really a package
  },
});
