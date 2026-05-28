const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'fonts');
const outputData = [];

if (!fs.existsSync(fontsDir)) {
    console.error('❌ 错误: 找不到 fonts 目录！');
    process.exit(1);
}

// 扫描 fonts 目录下的所有子文件夹
const folders = fs.readdirSync(fontsDir).filter(file =>
    fs.statSync(path.join(fontsDir, file)).isDirectory()
);

folders.forEach(folder => {
    const folderPath = path.join(fontsDir, folder);
    const cssPath = path.join(folderPath, 'result.css');
    const metaPath = path.join(folderPath, 'meta.json');

    // 只有同时存在 css 和 meta 信息的才会被收录
    if (fs.existsSync(cssPath) && fs.existsSync(metaPath)) {
        try {
            const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            outputData.push({
                folder: `fonts/${folder}`,
                ...metaData
            });
        } catch (e) {
            console.error(`❌ 解析 ${folder}/meta.json 失败:`, e);
        }
    } else {
        console.warn(`⚠️ 跳过 ${folder}: 未找到完整构建产物 (缺少 result.css 或 meta.json)`);
    }
});

// 将清洗拼合后的数据输出给前端
fs.writeFileSync(
    path.join(__dirname, 'fonts.data.json'),
    JSON.stringify(outputData, null, 2),
    'utf-8'
);

console.log(`\n============== 构建完成 ==============`);
console.log(`✅ 成功扫描并打包了 ${outputData.length} 个独立字体模块`);
console.log(`=====================================\n`);