/**
 * 页面间切换路由：管理页面动画的触发与导航顺序。
 */

// 页面顺序定义，决定切换方向（靠后 = 向右/前进，靠前 = 向左/后退）
const PAGE_ORDER = ['page-main', 'page-article', 'page-article-detail', 'page-projects', 'page-about'];

// 动画锁：为 true 时忽略新的导航请求，防止动画叠加
let isAnimating = false;

// 从注册表取出指定页面的进入动画，未注册则回落到 default
function _getEnter(pageId) {
    return PAGE_ANIMATIONS[pageId]?.enter ?? PAGE_ANIMATIONS['default'].enter;
}

// 从注册表取出指定页面的退出动画，未注册则回落到 default
function _getExit(pageId) {
    return PAGE_ANIMATIONS[pageId]?.exit ?? PAGE_ANIMATIONS['default'].exit;
}

// 切换到指定页面，先执行当前页退出动画，完成后执行目标页进入动画
function navigateTo(targetId) {
    // 动画进行中则忽略本次导航
    if (isAnimating) return;

    // 获取当前激活页面与目标页面元素
    const current = document.querySelector('.page.active');
    const target = document.getElementById(targetId);

    // 目标不存在或已是当前页则不切换
    if (!target || current === target) return;

    // 根据 PAGE_ORDER 中的位置判断前进还是后退
    const forward = PAGE_ORDER.indexOf(targetId) > PAGE_ORDER.indexOf(current.id);
    // 加锁防止动画叠加
    isAnimating = true;

    // 先执行退出动画，完成后再执行进入动画
    _getExit(current.id)(current, forward).then(() => {
        // 退出完成：立即隐藏当前页，更新 active 状态
        current.classList.remove('active');
        // 清除动画写入的内联样式
        current.style.cssText = '';

        // 执行目标页进入动画
        return _getEnter(targetId)(target, forward);
    }).then(() => {
        // 进入完成：激活目标页
        target.classList.add('active');
        // 清除动画写入的内联样式
        target.style.cssText = '';
        // 解锁
        isAnimating = false;
    });
}
