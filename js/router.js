/**
 * 页面间切换路由：管理页面动画的触发与导航顺序，以及 URL hash 同步。
 */

// 页面顺序定义，决定切换方向（靠后 = 向右/前进，靠前 = 向左/后退）
const PAGE_ORDER = ['page-main', 'page-article', 'page-article-detail', 'page-projects', 'page-about'];

// 动画锁：为 true 时忽略新的导航请求，防止动画叠加
let isAnimating = false;

// 当前打开的文章 slug（文件名去掉 .md），由 article.js 在调用 navigateTo 前赋值
// 声明在此处的原因：_setHash 构建 hash 时需要读取这个值，放在 router.js 中使
// article.js 和 router.js 都能直接访问，不需要通过函数参数传递
let _currentArticleSlug = null;

// 标志位：代码主动修改 hash 时置 true，防止 hashchange 事件循环触发导航
let _programmaticHash = false;

// page-id 到 hash 路径的映射表（文章详情页由 _currentArticleSlug 动态拼接）
const _PAGE_HASH = {
    'page-main':     '/',
    'page-article':  '/article',
    'page-projects': '/projects',
    'page-about':    '/about'
};

// 根据页面 ID 构建完整 hash 路径字符串
function _buildHash(pageId) {
    if (pageId === 'page-article-detail') {
        return '/article/' + (_currentArticleSlug ?? '');
    }
    return _PAGE_HASH[pageId] ?? '/';
}

// 将 hash 写入地址栏，并在下一个事件循环重置标志
// hashchange 事件在同步赋值后异步触发，setTimeout(0) 确保标志在回调执行前仍为 true
function _setHash(pageId) {
    // 先置标志、再写 hash，保证 hashchange 回调触发时标志已为 true
    _programmaticHash = true;
    window.location.hash = _buildHash(pageId);
    // 必须用 setTimeout(0) 而非同步重置：hashchange 事件虽然由同步赋值触发，
    // 但回调本身在当前同步代码执行完毕后才进入事件队列，setTimeout(0) 同理，
    // 两者都在同一个"下一次事件循环"执行，确保标志在回调执行完之后才被清除
    setTimeout(() => { _programmaticHash = false; }, 0);
}

// 解析当前地址栏 hash，返回 { pageId, articleSlug }
function _parseHash() {
    const path = window.location.hash.replace('#', '') || '/';
    if (path === '/' || path === '')           return { pageId: 'page-main',           articleSlug: null };
    if (path === '/article')                   return { pageId: 'page-article',         articleSlug: null };
    if (path.startsWith('/article/'))          return { pageId: 'page-article-detail',  articleSlug: path.slice('/article/'.length) };
    if (path === '/projects')                  return { pageId: 'page-projects',        articleSlug: null };
    if (path === '/about')                     return { pageId: 'page-about',           articleSlug: null };
    return { pageId: 'page-main', articleSlug: null };
}

// 从注册表取出指定页面的进入动画，未注册则回落到 default
function _getEnter(pageId) {
    return PAGE_ANIMATIONS[pageId]?.enter ?? PAGE_ANIMATIONS['default'].enter;
}

// 从注册表取出指定页面的退出动画，未注册则回落到 default
function _getExit(pageId) {
    return PAGE_ANIMATIONS[pageId]?.exit ?? PAGE_ANIMATIONS['default'].exit;
}

// 切换到指定页面
// silent 为 true 时直接切换 class，不播放动画（专用于页面初始化）
function navigateTo(targetId, silent = false) {
    // silent 模式专供初始化使用，此时页面还没有播放过任何动画，不受动画锁约束
    if (!silent && isAnimating) return;

    const current = document.querySelector('.page.active');
    const target  = document.getElementById(targetId);

    if (!target || current === target) return;

    // 更新地址栏 hash
    _setHash(targetId);

    if (silent) {
        // 静默切换：仅操作 class，不触发动画系统
        current.classList.remove('active');
        current.style.cssText = '';
        target.classList.add('active');
        target.style.cssText = '';
        return;
    }

    // 根据 PAGE_ORDER 中的位置判断前进还是后退
    const forward = PAGE_ORDER.indexOf(targetId) > PAGE_ORDER.indexOf(current.id);
    isAnimating = true;

    _getExit(current.id)(current, forward).then(() => {
        current.classList.remove('active');
        current.style.cssText = '';
        return _getEnter(targetId)(target, forward);
    }).then(() => {
        target.classList.add('active');
        target.style.cssText = '';
        isAnimating = false;
    });
}

// 处理浏览器前进/后退引发的 hash 变化
window.addEventListener('hashchange', () => {
    // 代码主动写入的 hash 变化，直接忽略
    if (_programmaticHash) return;

    if (isAnimating) {
        // 动画进行中无法打断导航；若放任 hash 变化，地址栏会显示后退目标页的 URL，
        // 但屏幕上仍是动画中的页面——用户此时刷新会跳到错误的页面，造成状态不同步
        // 解决方法：把 hash 强制恢复为当前激活页，相当于"撤销"这次后退操作
        const activeId = document.querySelector('.page.active')?.id;
        if (activeId) _setHash(activeId);
        return;
    }

    const { pageId, articleSlug } = _parseHash();

    if (pageId === 'page-article-detail' && articleSlug) {
        // 先渲染文章内容，再导航（restoreArticle 由 article.js 在运行时提供）
        const found = restoreArticle(articleSlug);
        navigateTo(found ? 'page-article-detail' : 'page-article');
    } else {
        navigateTo(pageId);
    }
});
