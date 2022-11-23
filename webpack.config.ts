//TS
import * as webpack from "webpack";
import * as path from "path";
import * as fs from "fs";
import "ts-loader";

//JS - no typings
const LiveReload = require("webpack-livereload-plugin");

module.exports = (env:any) => {
    return {
        entry: "./index.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
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
            new LiveReload({})
        ],
    }
}