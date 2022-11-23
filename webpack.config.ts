//TS
import * as webpack from "webpack";
import * as path from "path";
import * as fs from "fs";
import "ts-loader";
import * as HTMLWebpackPlugin from "html-webpack-plugin";

//JS - no typings
const LiveReload = require("webpack-livereload-plugin");

module.exports = (env:any) => {
    return {
        entry: "./index.ts",
        output: {
            path: path.resolve(__dirname, "docs"),
            filename: "bundle.js",
            publicPath: "/assets/",
            library: "MyLibrary",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.glsl$/,
                    loader: 'webpack-glsl-loader'
                },
                {
                    test: /\.css$/,
                    use: [ 'style-loader', 'css-loader' ]
                }
            ],
        },
        resolve: {
            modules: [
                "node_modules",
            ],

            extensions: [".ts", ".json"],
            alias: {
            },
        },
        context: __dirname,
        target: "web",
        plugins: [
            new LiveReload({}),
            new HTMLWebpackPlugin({
                title: 'Computer Graphics',
                template: 'index.html',
              })
        ],
    }
}