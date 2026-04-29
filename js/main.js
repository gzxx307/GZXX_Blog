/**
 * 页面初始化脚本：绑定导航与按钮事件，启动首屏动画。
 */

// 绑定导航链接点击事件
// 所有带有 data-page 属性的元素点击后会切换到对应页面
document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
        // 阻止默认行为（如 <a> 标签的跳转）
        e.preventDefault();
        navigateTo(el.dataset.page);
    });
});

// 绑定返回按钮点击事件：从文章详情页返回文章列表页
document.getElementById('back-btn').addEventListener('click', () => {
    navigateTo('page-article');
});
// 绑定文章列表搜索事件
document.getElementById('search-btn').addEventListener('click', () => {
    searchArticles(document.getElementById('search-input').value);
});

// 页面初始化

// 加载文章列表
loadArticleList();
// 加载关于页面
loadAboutPage();

// 解析初始 hash，决定首屏显示哪个页面
const _initRoute = _parseHash();

if (_initRoute.pageId === 'page-main') {
    // 无 hash 或主页：播放主页入场动画（原有行为）
    PAGE_ANIMATIONS['page-main'].enter(document.getElementById('page-main'), true);
} else if (_initRoute.pageId === 'page-article-detail' && _initRoute.articleSlug) {
    // 文章详情：先渲染文章，再静默切换到详情页
    const found = restoreArticle(_initRoute.articleSlug);
    navigateTo(found ? 'page-article-detail' : 'page-article', true);
} else {
    // 其他页面（文章列表、作品、关于）：静默切换，不播放主页动画
    navigateTo(_initRoute.pageId, true);
}
