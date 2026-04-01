/**
 * 默认页面切换动画：整个界面向左或向右滑动，方向由导航顺序决定。
 */

// 单次滑动动画时长（毫秒）
const _SLIDE_MS = 380;
// 滑动缓动曲线
const _SLIDE_EASE = `cubic-bezier(0.4, 0, 0.2, 1)`;

/**
 * 滑入动画（目标页）
 * @param {HTMLElement} el 目标页面元素
 * @param {boolean} forward 是否为向前导航
 * @returns {Promise} 动画完成的 Promise
 */
function _defaultEnter(el, forward) {
    return new Promise(resolve => {
        // 先瞬间将目标页置于屏幕外（覆盖 CSS 的 translateX(100%)）
        el.style.transition = 'none';
        // 根据导航方向决定初始偏移：向前从右侧进入，向后从左侧进入
        el.style.transform = forward ? 'translateX(100%)' : 'translateX(-100%)';

        // 双层 rAF：确保浏览器先渲染初始位置，再开启过渡
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 开启过渡并将元素滑至可见位置
                el.style.transition = `transform ${_SLIDE_MS}ms ${_SLIDE_EASE}`;
                el.style.transform = 'translateX(0)';
                // 等待动画结束后 resolve
                setTimeout(resolve, _SLIDE_MS + 20);
            });
        });
    });
}

/**
 * 滑出动画（当前页）
 * @param {HTMLElement} el 当前页面元素
 * @param {boolean} forward 是否为向前导航
 * @returns {Promise}
 */
function _defaultExit(el, forward) {
    return new Promise(resolve => {
        // 开启过渡并将元素滑出屏幕：向前则向左滑出，向后则向右滑出
        el.style.transition = `transform ${_SLIDE_MS}ms ${_SLIDE_EASE}`;
        el.style.transform = forward ? 'translateX(-100%)' : 'translateX(100%)';
        // 等待动画结束后 resolve
        setTimeout(resolve, _SLIDE_MS + 20);
    });
}

// 注册默认动画到全局注册表
PAGE_ANIMATIONS['default'] = {
    enter: _defaultEnter,
    exit: _defaultExit
};
