/**
 * 文章列表生成、渲染与交互脚本。
 */

// 被过滤的文章列表，初始为全部文章，搜索时更新
// 真正渲染时使用该变量
let filteredArticles = ARTICLES_DATA.slice();

// 动画过程中拒绝再触发动画
let isArticleAnimating = false;
// 当前选中的标签，null 表示未选中
let selectedTag = null;
// 文章内部锚点链接点击事件是否已绑定（委托在 #article-content 上，只需绑定一次）
let _articleInternalLinksBound = false;

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
        // 如果文件名为 "about_me.md"，则跳过该文章（不在列表中显示）
        if (article.file === 'about_me.md') return;
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

// 将文章的标签与正文渲染到详情页 DOM，不执行任何导航
function _renderArticleContent(article) {
    // 将 tags 数组转为标签 HTML
    const tagsHtml = article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    // 渲染标签列表到 TOC 面板顶部
    document.getElementById('toc-tags').innerHTML = tagsHtml;
    // 将 Markdown 中的数学公式用 HTML 注释占位符保护起来，
    // 以免 marked 将公式内的 _ ^ 等字符误解析为 Markdown 语法（斜体、粗体等）
    let content = article.content;
    const mathBlocks = [];
    const mathInlines = [];
    // 先用占位符替换 $$...$$ 块级公式（支持跨行）
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
        mathBlocks.push(formula.trim());
        return `<!--math-block-${mathBlocks.length - 1}-->`;
    });
    // 再用占位符替换 $...$ 行内公式（不匹配 $$，不跨行）
    content = content.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_, formula) => {
        mathInlines.push(formula.trim());
        return `<!--math-inline-${mathInlines.length - 1}-->`;
    });
    // 将保护后的内容交给 marked 解析为 HTML
    const articleEl = document.getElementById('article-content');
    articleEl.innerHTML = marked.parse(content);
    // 从高索引到低索引反向恢复公式，避免 <!--math-block-1--> 误匹配 <!--math-block-10--> 的前缀
    for (let i = mathBlocks.length - 1; i >= 0; i--) {
        articleEl.innerHTML = articleEl.innerHTML.replace(
            `<!--math-block-${i}-->`,
            katex.renderToString(mathBlocks[i], { displayMode: true })
        );
    }
    for (let i = mathInlines.length - 1; i >= 0; i--) {
        articleEl.innerHTML = articleEl.innerHTML.replace(
            `<!--math-inline-${i}-->`,
            katex.renderToString(mathInlines[i], { displayMode: false })
        );
    }
    // 对所有代码块应用 highlight.js 语法高亮
    document.querySelectorAll('#article-content pre code').forEach(block => {
        hljs.highlightElement(block);
    });
    // 内容写入后立即初始化目录、灯箱与内部锚点链接
    initToc();
    initLightbox();
    initArticleInternalLinks();

    // 构建可导航文章列表（排除 about_me.md）
    const navList = ARTICLES_DATA.filter(a => a.file !== 'about_me.md');
    const currentIndex = navList.findIndex(a => a.file === article.file);
    const scrollEl = document.getElementById('page-article-detail');

    const prevBtn = document.getElementById('prev-article-btn');
    const nextBtn = document.getElementById('next-article-btn');

    // 上一篇：在数组中排在前面的文章
    const prevArticle = currentIndex > 0 ? navList[currentIndex - 1] : null;
    if (prevArticle) {
        prevBtn.textContent = '← ' + prevArticle.title;
        prevBtn.style.display = '';
        prevBtn.onclick = () => {
            switchArticleInPlace(() => {
                scrollEl.scrollTop = 0;
                _currentArticleSlug = prevArticle.file.replace('.md', '');
                _renderArticleContent(prevArticle);
            });
        };
    } else {
        prevBtn.style.display = 'none';
    }

    // 下一篇：在数组中排在后面的文章
    const nextArticle = currentIndex < navList.length - 1 ? navList[currentIndex + 1] : null;
    if (nextArticle) {
        nextBtn.textContent = nextArticle.title + ' →';
        nextBtn.style.display = '';
        nextBtn.onclick = () => {
            switchArticleInPlace(() => {
                scrollEl.scrollTop = 0;
                _currentArticleSlug = nextArticle.file.replace('.md', '');
                _renderArticleContent(nextArticle);
            });
        };
    } else {
        nextBtn.style.display = 'none';
    }
}

// 打开文章详情页：渲染内容、设置 slug、执行带动画的导航
function openArticle(article) {
    _renderArticleContent(article);
    // 必须在 navigateTo 之前赋值：navigateTo 内部调用 _setHash 时会立即读取此变量来
    // 构建 hash 字符串，若赋值在 navigateTo 之后，_setHash 拿到的仍是 null，
    // 地址栏会错误地变成 #/article/ 而非 #/article/docker
    _currentArticleSlug = article.file.replace('.md', '');
    navigateTo('page-article-detail');
}

// 为文章内容中的内部锚点链接（href="#xxx"）绑定平滑滚动点击委托
// 仅需绑定一次：事件委托在 #article-content 上，innerHTML 替换不影响委托
function initArticleInternalLinks() {
    if (_articleInternalLinksBound) return;
    _articleInternalLinksBound = true;

    // 使用 querySelector 精确选中文章详情页内的 #article-content，避免与关于页面的重复 id 冲突
    const content = document.querySelector('#page-article-detail #article-content');
    if (!content) return;

    content.addEventListener('click', (e) => {
        // 找到最近的符合内部锚点特征的 <a> 标签
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        // 跳过路由 hash（#/xxx）和空锚点
        if (!href || href === '#' || href.startsWith('#/')) return;

        e.preventDefault();
        const targetId = decodeURIComponent(href.slice(1));
        // toc.js 的 _buildToc() 会将标题 id 改为 <slug>-<index> 格式，
        // 但文章内 markdown 链接仍指向原始 id，因此需要两级查找：
        // 先精确匹配，失败后再按 toc.js 添加的后缀模式（targetId-数字）前缀匹配
        let targetEl = document.getElementById(targetId);
        if (!targetEl) {
            targetEl = document.querySelector('[id^="' + CSS.escape(targetId) + '-"]');
        }
        if (!targetEl) return;

        // 在文章详情页的滚动容器内平滑滚动到目标元素
        const scrollEl = document.getElementById('page-article-detail');
        const containerTop = scrollEl.getBoundingClientRect().top;
        const targetTop = targetEl.getBoundingClientRect().top;
        const targetScrollTop = scrollEl.scrollTop + (targetTop - containerTop) - 80;
        _smoothScrollTo(scrollEl, targetScrollTop, 500);
    });
}

// 根据 slug 恢复文章内容与 slug 状态，返回是否找到文章
// 不在内部调用 navigateTo 的原因：初始化时需要 silent=true 静默切换，hashchange 时
// 需要带动画正常切换，两个场景对 navigateTo 的调用方式不同，由调用方自己决定更灵活
function restoreArticle(slug) {
    const article = ARTICLES_DATA.find(a => a.file === slug + '.md');
    if (!article) return false;
    _renderArticleContent(article);
    _currentArticleSlug = slug;
    return true;
}

// 搜索文章，根据输入关键词过滤文章列表
function searchArticles(keyword) {
    // 如果在动画中则不响应搜索请求
    if (isArticleAnimating) return;
    // 设置动画锁，防止在动画过程中再次触发搜索
    isArticleAnimating = true;
    // 清除标签筛选状态
    selectedTag = null;
    const tagEls = document.querySelectorAll('#tag-list-panel .article-tag');
    tagEls.forEach(el => el.classList.remove('active'));
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
        }
    );
    // 解除动画锁
    isArticleAnimating = false;
}

// 从 ARTICLES_DATA 中提取所有唯一标签并排序
function getAllTags() {
    const tagSet = new Set();
    ARTICLES_DATA.forEach(article => {
        article.tags.forEach(tag => tagSet.add(tag));
    });
    return [...tagSet].sort();
}

// 渲染标签列表到标签面板
function renderTagList() {
    const panel = document.getElementById('tag-list-panel');
    if (!panel) return;
    const tags = getAllTags();
    // 生成标签 HTML，当前选中标签添加 active 类
    panel.innerHTML = tags.map(tag => {
        const isActive = tag === selectedTag;
        return `<span class="article-tag ${isActive ? 'active' : ''}" data-tag="${tag}">${tag}</span>`;
    }).join('');
    // 为每个标签绑定点击过滤事件
    panel.querySelectorAll('.article-tag').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
            const tag = tagEl.dataset.tag;
            if (selectedTag === tag) {
                // 取消选中状态，显示全部文章
                filterByTag(null);
            } else {
                // 选中标签并按标签过滤文章
                filterByTag(tag);
            }
        });
    });
}

// 按标签过滤文章列表
function filterByTag(tag) {
    // 如果在动画中则不响应
    if (isArticleAnimating) return;
    isArticleAnimating = true;
    // 更新选中标签状态
    selectedTag = tag;
    // 更新标签面板中各标签的激活样式
    const tagEls = document.querySelectorAll('#tag-list-panel .article-tag');
    tagEls.forEach(el => {
        el.classList.toggle('active', el.dataset.tag === tag);
    });
    // 清除搜索框内容
    document.getElementById('search-input').value = '';
    // 按标签过滤或显示全部文章
    if (!tag) {
        filteredArticles = ARTICLES_DATA.slice();
    } else {
        filteredArticles = ARTICLES_DATA.filter(article => article.tags.includes(tag));
    }
    // 若过滤结果为空则显示提示
    if (filteredArticles.length === 0) {
        showNoResults();
    }
    // 复用搜索动画：旧卡片淡出 → 更新列表 → 新卡片淡入
    PAGE_ANIMATIONS['page-article-search'].enter(
        document.getElementById('page-article'),
        () => {
            const container = document.getElementById('article-list');
            container.innerHTML = '';
            loadArticleList();
        }
    );
    // 解除动画锁
    isArticleAnimating = false;
}

// 切换标签面板的显示/隐藏
function toggleTagPanel() {
    const panel = document.getElementById('tag-list-panel');
    const btn = document.getElementById('tag-filter-btn');
    if (!panel || !btn) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        // 关闭面板
        panel.classList.remove('open');
        btn.classList.remove('active');
    } else {
        // 打开面板前渲染最新的标签列表
        renderTagList();
        panel.classList.add('open');
        btn.classList.add('active');
    }
}

// 重置标签筛选状态：关闭面板、清除选中、恢复按钮样式
function resetTagFilter() {
    selectedTag = null;
    const panel = document.getElementById('tag-list-panel');
    const btn = document.getElementById('tag-filter-btn');
    if (panel) panel.classList.remove('open');
    if (btn) btn.classList.remove('active');
    // 清除标签面板中各标签的激活样式
    const tagEls = document.querySelectorAll('#tag-list-panel .article-tag');
    tagEls.forEach(el => el.classList.remove('active'));
}