function loadAboutMeCard() {
    const card = document.getElementById('self-introduction-card');
    if (!card) return;
    const content = card.querySelector('#article-content');
    if (!content) return;
    // 读取 about_me.md 文件内容并显示在卡片内
    ARTICLES_DATA.filter(a => a.file === 'about_me.md').forEach(article => {
        content.innerHTML = marked.parse(article.content);
    });
}

function loadAboutPage() {
    loadAboutMeCard();
}