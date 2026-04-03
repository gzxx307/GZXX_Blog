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

// 触发主页入场动画（页面首次加载时也需要构建并展示卡片）
PAGE_ANIMATIONS['page-main'].enter(document.getElementById('page-main'), true);
