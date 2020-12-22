// 设置入口文件

const fs = require("fs");
const path = require("path");

const tsPath = path.resolve(__dirname, "../src/ts");//ts目录路径
const tsFiles = fs.readdirSync(tsPath);//获取模板文件列表

let entry = {};//入口文件

tsFiles.forEach(file => {
    let stat = fs.statSync(path.resolve(tsPath, file));

    // 判断是目录还是文件
    if(stat.isFile()){
        let fileName = file.split('.ts')[0];
        //设置入口文件
        entry[fileName] = "./src/ts/" + file;
    }
});

console.log(entry);

module.exports = entry;