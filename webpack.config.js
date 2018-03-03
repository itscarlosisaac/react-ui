const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env) => {
 const isProduction = env === 'production';
 const CSSExtract = new ExtractTextPlugin('styles.css');

 return {
  entry: {
   app: ['./src/App.js'],
   vendor: ['react', 'react-dom', 'react-router-dom'],
  },
  output: {
   filename: '[name].bundle.js',
   path: path.join(__dirname, 'dist')
  },
  optimization: {
   splitChunks: {
    cacheGroups: {
     vendor: {
      name: "vendor",
      test: "vendor",
      enforce: true
     }
    }
   }
  },
  plugins: [
   // CSSExtract
  ],
  module: {
   rules: [{
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /node_modules/
   }, {
    test: /\.s?css/,
    use: [
     'style-loader',
     'css-loader',
     'sass-loader'
    ]
   }]
  },
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  devServer: {
   contentBase: path.join(__dirname, 'dist'),
   historyApiFallback: true
  }
 }
}
