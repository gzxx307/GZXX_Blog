/**
 * 关于页动画：各卡片依次淡入。
 */

// 单张卡片动画时长（毫秒）
const _ABOUT_MS = 400;
// 相邻卡片动画延迟（毫秒）
const _ABOUT_STAGGER = 60;

PAGE_ANIMATIONS['page-about'] = {
    enter(el, forward) {
        return new Promise(resolve => {
            // 覆盖 CSS 的 translateX(100%)，使页面显示在可见位置
            el.style.transform = 'translateX(0)';

            // 获取页面内所有卡片
            const cards = Array.from(el.querySelectorAll('.card'));
            // 若无卡片则直接完成
            if (cards.length === 0) { resolve(); return; }

            // 初始状态：所有卡片透明
            cards.forEach(card => {
                card.style.transition = 'none';
                card.style.opacity = '0';
            });

            // 双层 rAF 确保初始状态渲染后再开启过渡
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 依次为每张卡片设置延迟淡入过渡
                    cards.forEach((card, i) => {
                        const delay = i * _ABOUT_STAGGER;
                        card.style.transition = `opacity ${_ABOUT_MS}ms ease ${delay}ms`;
                        card.style.opacity = '1';
                    });

                    // 计算所有卡片动画完成的总时长
                    const total = _ABOUT_MS + (cards.length - 1) * _ABOUT_STAGGER;
                    setTimeout(() => {
                        // 清除内联样式，恢复 CSS 控制
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
