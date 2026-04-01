/**
 * 文章列表页动画：各卡片依次从下方淡入滑上，退出及搜索时向下淡出。
 */

// 单张卡片动画时长（毫秒）
const _ARTICLE_MS = 360;
// 相邻卡片启动延迟（毫秒）
const _ARTICLE_STAGGER = 60;

PAGE_ANIMATIONS['page-article'] = {
    enter(el, forward) {
        return new Promise(resolve => {
            // 只用 transform 将 section 移至可见位置，不设 opacity
            // 对 section 设置 opacity < 1 会创建合成层，导致子元素 backdrop-filter 只模糊空白而非背景图
            el.style.transform = 'translateX(0)';

            // 获取页面内所有卡片
            const cards = Array.from(el.querySelectorAll('.card'));
            // 若无卡片则直接完成
            if (cards.length === 0) { resolve(); return; }

            // 获取搜索框容器
            const searchBox = el.querySelector('.search-input');

            // 初始状态：搜索框与各卡片均下移 24px 且透明
            if (searchBox) {
                searchBox.style.transition = 'none';
                searchBox.style.transform = 'translateY(24px)';
                searchBox.style.opacity = '0';
            }
            cards.forEach(card => {
                card.style.transition = 'none';
                card.style.transform = 'translateY(24px)';
                card.style.opacity = '0';
            });

            // 双层 rAF 确保初始状态渲染后再开启过渡
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 为搜索框添加过渡
                    if (searchBox) {
                        searchBox.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1),`
                                                   + `opacity ${_ARTICLE_MS}ms ease`;
                        searchBox.style.transform = 'translateY(0)';
                        searchBox.style.opacity = '1';
                    }
                    // 依次为每张卡片设置延迟过渡
                    cards.forEach((card, i) => {
                        const delay = i * _ARTICLE_STAGGER;
                        card.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                              + `opacity ${_ARTICLE_MS}ms ease ${delay}ms`;
                        card.style.transform = 'translateY(0)';
                        card.style.opacity = '1';
                    });

                    // 等待所有卡片动画结束后清理内联样式并 resolve
                    const total = _ARTICLE_MS + (cards.length - 1) * _ARTICLE_STAGGER;
                    setTimeout(() => {
                        if (searchBox) { searchBox.style.cssText = ''; }
                        cards.forEach(card => { card.style.cssText = ''; });
                        resolve();
                    }, total + 20);
                });
            });
        });
    },

    // 退出时各卡片与搜索框依次向下淡出
    exit(el, forward) {
        return new Promise(resolve => {
            // 获取搜索框与所有卡片
            const searchBox = el.querySelector('.search-input');
            const cards = Array.from(el.querySelectorAll('.card'));

            // 若无内容则回退到默认滑出
            if (!searchBox && cards.length === 0) {
                return PAGE_ANIMATIONS['default'].exit(el, forward).then(resolve);
            }

            // 搜索框与卡片同步向下淡出，搜索框无延迟
            if (searchBox) {
                searchBox.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1),`
                                           + `opacity ${_ARTICLE_MS}ms ease`;
                searchBox.style.transform = 'translateY(24px)';
                searchBox.style.opacity = '0';
            }
            // 各卡片依次向下淡出
            cards.forEach((card, i) => {
                const delay = i * _ARTICLE_STAGGER;
                card.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                      + `opacity ${_ARTICLE_MS}ms ease ${delay}ms`;
                card.style.transform = 'translateY(24px)';
                card.style.opacity = '0';
            });

            // 等待最后一张卡片动画结束后 resolve
            const total = _ARTICLE_MS + (cards.length > 0 ? (cards.length - 1) * _ARTICLE_STAGGER : 0);
            setTimeout(resolve, total + 20);
        });
    }
};

// 搜索动画：旧卡片向下淡出后更新列表，再将新卡片淡入
// onMidpoint 在淡出结束后、淡入开始前被调用，用于更新 DOM
PAGE_ANIMATIONS['page-article-search'] = {
    enter(el, onMidpoint) {
        return new Promise(resolve => {
            // 获取当前所有卡片（搜索框不参与淡出）
            const oldCards = Array.from(el.querySelectorAll('.card'));

            // 内部函数：将新卡片淡入，结束后 resolve
            function fadeInNewCards() {
                const newCards = Array.from(el.querySelectorAll('.card'));
                // 若无新卡片则直接完成
                if (newCards.length === 0) { resolve(); return; }

                // 初始状态：新卡片下移 24px 且透明
                newCards.forEach(card => {
                    card.style.transition = 'none';
                    card.style.transform = 'translateY(24px)';
                    card.style.opacity = '0';
                });

                // 双层 rAF 确保初始状态渲染后再开启过渡
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // 依次为新卡片设置延迟过渡，向上淡入
                        newCards.forEach((card, i) => {
                            const delay = i * _ARTICLE_STAGGER;
                            card.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                                  + `opacity ${_ARTICLE_MS}ms ease ${delay}ms`;
                            card.style.transform = 'translateY(0)';
                            card.style.opacity = '1';
                        });

                        // 等待全部淡入结束后清理内联样式并 resolve
                        const total = _ARTICLE_MS + (newCards.length - 1) * _ARTICLE_STAGGER;
                        setTimeout(() => {
                            newCards.forEach(card => { card.style.cssText = ''; });
                            resolve();
                        }, total + 20);
                    });
                });
            }

            // 若当前没有卡片则跳过淡出，直接更新 DOM 并淡入
            if (oldCards.length === 0) {
                onMidpoint();
                fadeInNewCards();
                return;
            }

            // 阶段一：旧卡片依次向下淡出（与入场方向相反）
            oldCards.forEach((card, i) => {
                const delay = i * _ARTICLE_STAGGER;
                card.style.transition = `transform ${_ARTICLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms,`
                                      + `opacity ${_ARTICLE_MS}ms ease ${delay}ms`;
                card.style.transform = 'translateY(24px)';
                card.style.opacity = '0';
            });

            // 淡出结束后：更新 DOM，再执行阶段二淡入
            const fadeOutTotal = _ARTICLE_MS + (oldCards.length - 1) * _ARTICLE_STAGGER;
            setTimeout(() => {
                // 调用外部回调更新文章列表
                onMidpoint();
                // 阶段二：新卡片淡入
                fadeInNewCards();
            }, fadeOutTotal + 20);
        });
    },

    exit(el, forward) {
        return PAGE_ANIMATIONS['default'].exit(el, forward);
    }
};
