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
      app: ["./src/app.js"],
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
        },
        {
          test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: 'file-loader?name=fonts/[name].[ext]'
        }
      ]
    },
    devtool: isProduction ? "source-map" : "inline-source-map",
    devServer: {
      port: 9000,
      contentBase: path.join(__dirname, "dist"),
      historyApiFallback: true
    }
  };
};
