const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const viewsPath = path.resolve(__dirname, "../src/views");//模板目录路径
const viewFiles = fs.readdirSync(viewsPath);//获取模板文件列表

let htmlPlugin = [];//创建模板文件

viewFiles.forEach(file => {
    let stat = fs.statSync(path.resolve(viewsPath, file));
    // 判断是目录还是文件
    if(stat.isFile()){
        let fileName = file.split('.html')[0];
        //设置模板文件
        let htmlTemplate = new HtmlWebpackPlugin({
            template: "./src/views/" + file, //模板文件地址
            filename: file, //输出后的html文件名称
            chunks: [fileName],
        });
        htmlPlugin.push(htmlTemplate);
    }
});

module.exports = htmlPlugin;