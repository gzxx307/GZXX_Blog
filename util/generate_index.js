// 扫描 articles/ 文件夹，将所有文章内容打包为 articles_data.js
// 在文章更新时运行 node generate-index.js 来更新数据

// 用于获取文件列表
const fs = require('fs');
// 用于获取文件路径
const path = require('path');

// 文章目录
const articlesDir = path.join(__dirname, '..\\articles');
console.log(`目标文章目录：${articlesDir}`);
// 文章列表
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

// lambda获取到文章
const articles = files.map(file => {
    // 异步读取指定路径下的文件，使用utf-8编码格式
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    // 使用换行符按行分割文件，得到字符串数组
    const lines = content.split('\n');

    // 移除正文中的'Tags:'行
    const filteredLines = lines.filter(line => !line.startsWith('Tags: '));
    const filteredContent = filteredLines.join('\n');

    // 提取标题（第一个 # 开头的行）
    const titleLine = lines.find(l => l.startsWith('# '));
    // 如果没有标题行，则使用文件名（去掉 .md）作为标题
    const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : file.replace('.md', '');

    // 提取Tag
    const tagLine = lines.find(l => l.startsWith('Tags: '));
    const tags = tagLine ? tagLine.replace(/^Tags:\s+/, '').split(',').map(t => t.trim()) : [];

    // 提取摘要（第一段正文）
    let excerpt = '';
    let started = false;
    for (const line of lines) {
        // 当遇到第一个 # 开头的行时，说明正文开始了，再往下一行开始提取摘要
        if (line.startsWith('#')) { started = true; continue; }
        // 如果还没有开始则继续扫描
        if (!started) continue;
        // 跳过标签行，避免标签内容混入摘要
        if (line.startsWith('Tags: ')) continue;
        // 如果遇到空行且excerpt已经有内容了，则说明已经提取完第一段，停止提取
        if (line.trim() === '') { if (excerpt) break; continue; }
        // 将当前行添加到摘要中，去掉首尾空格，并在行末添加一个空格
        excerpt += line.trim() + ' ';
        // 如果摘要长度过长则强制停止（120个字符）
        if (excerpt.length > 120) break;
    }
    // 选择提取到的摘要的最多前120个字符，如果摘要长度大于120则在末尾添加省略号
    excerpt = excerpt.trim().slice(0, 120) + (excerpt.length > 120 ? '...' : '');

    // 文件修改时间作为日期
    const stat = fs.statSync(path.join(articlesDir, file));
    // 将修改时间转换为 ISO 格式的字符串，并取前10个字符（即年月日部分）
    const date = stat.mtime.toISOString().slice(0, 10);

    // 返回所有数据，正文内容已移除'Tags:'行
    return { file, title, tags, excerpt, date, content: filteredContent };
});

// 按修改时间降序排序（最新的文章排在前面）
articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// 创建输出部分，使用 JSON.stringify 将 articles 数组转换为格式化的字符串，并添加 const ARTICLES_DATA = 前缀和分号后缀
const output = `const ARTICLES_DATA = ${JSON.stringify(articles, null, 5)};\n`;
// 异步写入目标文件
fs.writeFileSync(path.join(__dirname, '..\\data\\articles_data.js'), output, 'utf-8');

// 输出日志
console.log(`已生成 ${path.join(__dirname, '..\\data\\articles_data.js')}，共 ${articles.length} 篇文章：`);
articles.forEach(a => console.log(`  - ${a.file}: ${a.title}`));
