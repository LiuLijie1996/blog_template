// 公共配置

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const entry = require("./entry");//入口文件
const htmlPlugin = require("./htmlPlugin");//模板文件

module.exports = {
    devtool: "inline-source-map",

    // 入口文件
    entry: entry,

    // 输出
    output: {
        path: path.resolve(__dirname, "../build"), //输出地址
        filename: "dist/js/[name].js", //输出后的文件名
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    // loader
    module: {
        rules: [
            // 样式解析
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'postcss-preset-env',
                                    ],
                                ],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },

            // ts解析
            {
                test: /\.tsx?$/,
                use: ['babel-loader', "ts-loader"],
                exclude: [path.resolve(__dirname, "../node_modules")]
            },

            // 解析图片
            {
                test: /\.(jpg|png|gif|jpeg)$/,
                loader: "url-loader",
                options: {
                    // 小于8kb的图片编译成base格式
                    limit: 8 * 1024,
                    // 关闭es6模块化引入方式
                    esModule: false,
                    // 图片重命名
                    name: "[hash:10].[ext]",
                    // 图片公共路径
                    publicPath: "/dist/images",
                    // 图片存放目录
                    outputPath: "dist/images",
                }
            },
            // 解析html文件中的img
            {
                test: /\.html$/,
                loader: "html-loader",
            },

            // 解析其他文件
            {
                exclude: /\.(html|js|ts|tsx|scss|css|jpg|jpeg|png|gif)$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[hash:10].[ext]",
                        publicPath: "/dist/iconfont", //公共路径
                        outputPath: "dist/iconfont", //文件存放目录
                    }
                }],
            },
        ]
    },
    // 插件
    plugins: [
        // 打包前先删除输出目录的所有文件
        new CleanWebpackPlugin(),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery"
        }),

        // 将css单独打包成一个文件
        new MiniCssExtractPlugin({
            filename: "dist/css/[name].css", //打包后的css文件名称
        }),

        // 压缩css代码
        new OptimizeCssAssetsPlugin(),

        // 模板文件
        ...htmlPlugin,
    ],

    optimization: {
        // 代码分割
        splitChunks: {
            chunks: "all",
            minChunks: 1, //要提取的chunk最少被引用1次
        },
    },
};