/**
 * 文章详情页动画：进入时卡片从下方滑入，向后退出时卡片向下滑出，向前退出时水平滑出。
 */

// 进入动画时长（毫秒）
const _DETAIL_ENTER_MS = 380;
// 退出动画时长（毫秒）
const _DETAIL_EXIT_MS = 300;
// 相邻卡片延迟（毫秒）
const _DETAIL_STAGGER = 50;

PAGE_ANIMATIONS['page-article-detail'] = {
    enter(el, forward) {
        return new Promise(resolve => {
            // 只用 transform 定位，不设 opacity，避免破坏子元素 backdrop-filter
            el.style.transform = 'translateX(0)';

            // 获取页面内所有卡片
            const cards = Array.from(el.querySelectorAll('.card'));
            // 若无卡片则直接完成
            if (cards.length === 0) { resolve(); return; }

            // 初始状态：各卡片下移 30px 且透明
            cards.forEach(card => {
                card.style.transition = 'none';
                card.style.transform = 'translateY(30px)';
                card.style.opacity = '0';
            });

            // 双层 rAF 确保初始状态渲染后再开启过渡
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 依次为每张卡片设置延迟过渡，从下方滑入
                    cards.forEach((card, i) => {
                        const delay = i * _DETAIL_STAGGER;
                        card.style.transition = `transform ${_DETAIL_ENTER_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                              + `opacity ${_DETAIL_ENTER_MS}ms ease ${delay}ms`;
                        card.style.transform = 'translateY(0)';
                        card.style.opacity = '1';
                    });

                    // 等待所有卡片动画结束后清理内联样式
                    const total = _DETAIL_ENTER_MS + (cards.length - 1) * _DETAIL_STAGGER;
                    setTimeout(() => {
                        cards.forEach(card => { card.style.cssText = ''; });
                        resolve();
                    }, total + 20);
                });
            });
        });
    },

    exit(el, forward) {
        // 向后（返回文章列表）：各卡片向下淡出
        if (!forward) {
            return new Promise(resolve => {
                // 反向遍历：最后进入的卡片最先退出
                const cards = Array.from(el.querySelectorAll('.card')).reverse();
                // 若无卡片则直接完成
                if (cards.length === 0) { resolve(); return; }

                // 依次为每张卡片设置向下淡出过渡
                cards.forEach((card, i) => {
                    const delay = i * _DETAIL_STAGGER;
                    card.style.transition = `transform ${_DETAIL_EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                          + `opacity ${_DETAIL_EXIT_MS}ms ease ${delay}ms`;
                    card.style.transform = 'translateY(30px)';
                    card.style.opacity = '0';
                });

                // 等待所有退出动画完成后清理内联样式
                const total = _DETAIL_EXIT_MS + (cards.length - 1) * _DETAIL_STAGGER;
                setTimeout(() => {
                    cards.forEach(card => { card.style.cssText = ''; });
                    resolve();
                }, total + 20);
            });
        }
        // 向前：默认水平滑出（纯 transform）
        return PAGE_ANIMATIONS['default'].exit(el, forward);
    }
};
