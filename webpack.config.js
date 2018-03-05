const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = env => {
  const isProduction = env === "production";
  const CSSExtract = new ExtractTextPlugin({
    allChunks: true,
    filename: "[name].css"
  });

  const OptimizeChunks = new webpack.optimize.CommonsChunkPlugin({
    name: "vendor",
    filename: "vendor.bundle.js"
  });

  return {
    entry: {
      app: ["./src/App.js"],
      vendor: ["react", "react-dom", "react-router-dom"]
    },
    output: {
      filename: "[name].bundle.js",
      path: path.join(__dirname, "dist")
    },
    plugins: [CSSExtract, OptimizeChunks],
    module: {
      rules: [
        {
          loader: "babel-loader",
          test: /\.js$/,
          exclude: /node_modules/
        },
        {
          test: /\.s?css/,
          use: ["style-loader", "css-loader", "sass-loader"]
        }
      ]
    },
    devtool: isProduction ? "source-map" : "inline-source-map",
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      historyApiFallback: true
    }
  };
};
