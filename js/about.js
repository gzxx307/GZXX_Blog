function loadAboutMeCard() {
    const card = document.getElementById('self-introduction-card');
    if (!card) return;
    const content = card.querySelector('#article-content');
    if (!content) return;
    // 读取 about_me.md 文件内容并显示在卡片内
    ARTICLES_DATA.filter(a => a.file === 'about_me.md').forEach(article => {
        // 用占位符保护数学公式，避免 marked 将公式内的 _ ^ 误解析为 Markdown 语法
        let md = article.content;
        const mathBlocks = [];
        const mathInlines = [];
        md = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, f) => {
            mathBlocks.push(f.trim());
            return `<!--math-block-${mathBlocks.length - 1}-->`;
        });
        md = md.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_, f) => {
            mathInlines.push(f.trim());
            return `<!--math-inline-${mathInlines.length - 1}-->`;
        });
        content.innerHTML = marked.parse(md);
        // 从高索引到低索引反向恢复，避免占位符前缀误匹配
        for (let i = mathBlocks.length - 1; i >= 0; i--) {
            content.innerHTML = content.innerHTML.replace(
                `<!--math-block-${i}-->`,
                katex.renderToString(mathBlocks[i], { displayMode: true })
            );
        }
        for (let i = mathInlines.length - 1; i >= 0; i--) {
            content.innerHTML = content.innerHTML.replace(
                `<!--math-inline-${i}-->`,
                katex.renderToString(mathInlines[i], { displayMode: false })
            );
        }
    });
}

function loadAboutPage() {
    loadAboutMeCard();
}