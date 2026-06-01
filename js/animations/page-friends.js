/**
 * 友链页动画：卡片依次淡入上移入场，反向淡出下移退场。
 */

// 单张卡片动画时长（毫秒）
const _FRIENDS_MS = 400;
// 相邻卡片动画延迟（毫秒）
const _FRIENDS_STAGGER = 60;
// 卡片入场时从下方偏移的像素
const _FRIENDS_OFFSET = 24;

PAGE_ANIMATIONS['page-friends'] = {
    enter(el, forward) {
        return new Promise(resolve => {
            // 覆盖 CSS 的 translateX(100%)，使页面显示在可见位置
            el.style.transform = 'translateX(0)';

            // 获取页面内所有卡片
            const cards = Array.from(el.querySelectorAll('.card'));
            // 若无卡片则直接完成
            if (cards.length === 0) { resolve(); return; }

            // 初始状态：所有卡片透明且下移
            cards.forEach(card => {
                card.style.transition = 'none';
                card.style.opacity = '0';
                card.style.transform = `translateY(${_FRIENDS_OFFSET}px)`;
            });

            // 双层 rAF 确保初始状态渲染后再开启过渡
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 依次为每张卡片设置延迟淡入上移过渡
                    cards.forEach((card, i) => {
                        const delay = i * _FRIENDS_STAGGER;
                        card.style.transition = `opacity ${_FRIENDS_MS}ms ease ${delay}ms, transform ${_FRIENDS_MS}ms ease ${delay}ms`;
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });

                    // 计算所有卡片动画完成的总时长
                    const total = _FRIENDS_MS + (cards.length - 1) * _FRIENDS_STAGGER;
                    setTimeout(() => {
                        // 清除内联样式，恢复 CSS 控制
                        cards.forEach(card => { card.style.cssText = ''; });
                        resolve();
                    }, total + 20);
                });
            });
        });
    },

    exit(el, forward) {
        return new Promise(resolve => {
            // 倒序遍历：最后入场的卡片最先退场
            const cards = Array.from(el.querySelectorAll('.card')).reverse();
            if (cards.length === 0) { resolve(); return; }

            // 依次为每张卡片设置淡出下移过渡
            cards.forEach((card, i) => {
                const delay = i * _FRIENDS_STAGGER;
                card.style.transition = `opacity ${_FRIENDS_MS}ms ease ${delay}ms, transform ${_FRIENDS_MS}ms ease ${delay}ms`;
                card.style.opacity = '0';
                card.style.transform = `translateY(${_FRIENDS_OFFSET}px)`;
            });

            // 等待最后一张卡片动画完成后清理并 resolve
            const total = _FRIENDS_MS + (cards.length - 1) * _FRIENDS_STAGGER;
            setTimeout(() => {
                cards.forEach(card => { card.style.cssText = ''; });
                resolve();
            }, total + 20);
        });
    }
};
