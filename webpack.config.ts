//TS
import * as path from "path";
import "ts-loader";
import * as HTMLWebpackPlugin from "html-webpack-plugin";

//JS - no typings
const LiveReload = require("webpack-livereload-plugin");

module.exports = (env: any) => {
  return {
    entry: "./index.ts",
    output: {
      path: path.resolve(__dirname, "docs"),
      filename: "bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.(jpg|png)$/,
          use: {
            loader: 'url-loader',
          },
          },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.glsl$/,
          loader: "webpack-glsl-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /test\.tsx?$/,
          use: 'mocha-loader',
          exclude: /node_modules/,
        }
      ],
    },
    resolve: {
      modules: ["node_modules"],

      extensions: [".ts", ".json"],
      alias: {},
    },
    context: __dirname,
    target: "web",
    plugins: [
      new LiveReload({}),
      new HTMLWebpackPlugin({
        title: "Computer Graphics",
        template: "index.html",
      }),
    ],
  };
};
