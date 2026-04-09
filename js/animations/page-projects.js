/**
 * 分类页动画：各卡片弹性缩放淡入，退出时水平滑出。
 */

// 单张卡片动画时长（毫秒）
const _CAT_MS = 380;
// 相邻卡片延迟（毫秒）
const _CAT_STAGGER = 50;

PAGE_ANIMATIONS['page-projects'] = {
    enter(el, forward) {
        return new Promise(resolve => {
            // 覆盖 CSS 的 translateX(100%)，使页面显示在可见位置，不设 opacity 避免破坏 backdrop-filter
            el.style.transform = 'translateX(0)';

            // 获取页面内所有卡片
            const cards = Array.from(el.querySelectorAll('.card'));
            // 若无卡片则直接完成
            if (cards.length === 0) { resolve(); return; }

            // 初始状态：各卡片缩小至 88% 且透明
            cards.forEach(card => {
                card.style.transition = 'none';
                card.style.transform = 'scale(0.88)';
                card.style.opacity = '0';
            });

            // 双层 rAF 确保初始状态渲染后再开启过渡
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 依次为每张卡片设置弹性缩放过渡
                    cards.forEach((card, i) => {
                        const delay = i * _CAT_STAGGER;
                        // 弹性曲线：超出后回弹
                        card.style.transition = `transform ${_CAT_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms,`
                                              + `opacity ${_CAT_MS}ms ease ${delay}ms`;
                        card.style.transform = 'scale(1)';
                        card.style.opacity = '1';
                    });

                    // 等待所有卡片动画完成后清理内联样式
                    const total = _CAT_MS + (cards.length - 1) * _CAT_STAGGER;
                    setTimeout(() => {
                        cards.forEach(card => { card.style.cssText = ''; });
                        resolve();
                    }, total + 20);
                });
            });
        });
    },

    // 退出使用默认水平滑出
    exit(el, forward) {
        return PAGE_ANIMATIONS['default'].exit(el, forward);
    }
};
