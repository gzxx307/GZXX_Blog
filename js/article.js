/**
 * 文章列表生成、渲染与交互脚本。
 */

// 被过滤的文章列表，初始为全部文章，搜索时更新
// 真正渲染时使用该变量
let filteredArticles = ARTICLES_DATA.slice();

// 动画过程中拒绝再触发动画
let isArticleAnimating = false;

// 当过滤结果为空时，显示默认提示信息
function showNoResults() {
    const container = document.getElementById('article-list');
    filteredArticles = [
        {
            title: '没有找到相关文章',
            date: '',
            excerpt: '请尝试其他关键词或检查标签。',
            content: '<p>请尝试其他关键词或检查标签。</p>',
            tags: []
        }
    ]
}

// 渲染文章列表
function loadArticleList() {
    // 获取文章列表容器
    const container = document.getElementById('article-list');
    // 遍历所有文章数据，为每篇文章创建卡片
    filteredArticles.forEach(article => {
        // 创建卡片 div 元素
        const card = document.createElement('div');
        // 添加样式类
        card.className = 'card article-card';
        // 将 tags 数组转为标签 HTML
        const tagsHtml = article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
        // 填充卡片内容：标题、日期、摘要、标签
        card.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <span class="article-date">${article.date}</span>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-tags">${tagsHtml}</div>
        `;
        // 点击卡片时打开对应文章详情
        card.addEventListener('click', () => openArticle(article));
        // 将卡片追加到容器中
        container.appendChild(card);
    });
}

// 自定义 marked 渲染器，修正图片路径：反斜杠转正斜杠，并补全 articles/ 前缀
marked.use({
    renderer: {
        image({ href, title, text }) {
            // 将反斜杠替换为正斜杠，使路径符合 URL 规范
            const src = 'articles/' + href.replace(/\\/g, '/');
            const titleAttr = title ? ` title="${title}"` : '';
            return `<img src="${src}" alt="${text}"${titleAttr}>`;
        }
    }
});

// 打开文章详情页：将 Markdown 解析为 HTML 并导航至详情页
function openArticle(article) {
    // 将 tags 数组转为标签 HTML
    const tagsHtml = article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    // 渲染标签列表
    document.getElementById('article-detail-tags').innerHTML = `<div class="article-tags">${tagsHtml}</div>`;
    // 将 Markdown 内容解析为 HTML 并写入详情页容器
    document.getElementById('article-content').innerHTML = marked.parse(article.content);
    // 切换到文章详情页
    navigateTo('page-article-detail');
}

// 搜索文章，根据输入关键词过滤文章列表
function searchArticles(keyword) {
    // 如果在动画中则不响应搜索请求
    if (isArticleAnimating) return;
    // 设置动画锁，防止在动画过程中再次触发搜索
    isArticleAnimating = true;
    // 去除输入两端空白并转换为小写，进行不区分大小写的搜索
    const query = keyword.trim().toLowerCase();
    // 如果输入为空，则显示全部文章
    if (query === '') {
        filteredArticles = ARTICLES_DATA.slice();
    } else {
        // 标题/摘要或标签任一条件满足即保留
        filteredArticles = ARTICLES_DATA.filter(article => {
            const matchTitleOrExcerpt = article.title.toLowerCase().includes(query) || article.excerpt.toLowerCase().includes(query);
            const matchTag = article.tags.some(tag => tag.toLowerCase().includes(query));
            return matchTitleOrExcerpt || matchTag;
        });
    }
    // 如果没有匹配结果，显示提示信息
    if (filteredArticles.length === 0) {
        showNoResults();
    }
    // 触发搜索动画：旧卡片淡出后更新列表，再将新卡片淡入
    PAGE_ANIMATIONS['page-article-search'].enter(
        document.getElementById('page-article'),
        () => {
            // 在淡出结束、淡入开始前清空并重新渲染列表
            const container = document.getElementById('article-list');
            container.innerHTML = '';
            loadArticleList();
            // 解除动画锁
            isArticleAnimating = false;
        }
    );
}