/**
 * 主页 BentoBox 卡片飞入/飞出动画。
 */

// 工具函数

/**
 * 线性插值：返回 a 到 b 之间 t 比例处的值。
 * @param {number} a 起始值（t=0 时）
 * @param {number} b 结束值（t=1 时）
 * @param {number} t 插值比例（0~1）
 * @returns {number}
 */
function lerp(a, b, t) { return a + (b - a) * t; }

// 缓出指数：开始快，结尾慢。公式：1 − 2^(−10t)
function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

// 缓入指数：开始慢，结尾快。公式：2^(10t−10)
function easeInExpo(t) { return t <= 0 ? 0 : Math.pow(2, 10 * t - 10); }

/**
 * rAF 动画驱动：按时间推进，每帧回调 onFrame(easedT)，结束时 resolve。
 * @param {number} duration 动画时长（ms）
 * @param {Function} easing 缓动函数
 * @param {Function} onFrame 每帧回调 (easedT: number) => void
 * @returns {Promise}
 */
function runAnimation(duration, easing, onFrame) {
    return new Promise(resolve => {
        // 记录动画开始时间戳
        const t0 = performance.now();
        function frame(now) {
            // 计算归一化时间 t（0~1），到达 1 时动画结束
            const t = Math.min((now - t0) / duration, 1);
            // 将缓动后的 t 传给回调，更新当前帧状态
            onFrame(easing(t));
            // 未结束则继续请求下一帧，否则 resolve
            t < 1 ? requestAnimationFrame(frame) : resolve();
        }
        requestAnimationFrame(frame);
    });
}


// 参考坐标系

// 参考画布宽度（像素），所有卡片坐标基于此坐标系定义，运行时按实际画布尺寸等比缩放
const REF_W = 1200;
// 参考画布高度（像素）
const REF_H = 700;

// 坐标计算

/**
 * 将参考坐标系的卡片数据缩放到实际画布，并计算飞入起始坐标。
 *
 * 飞入方向规则（4 正交方向）：
 * |offX| > |offY| → 水平方向（左或右）；Y 不变，X 从屏幕外开始
 * |offX| ≤ |offY| → 垂直方向（上或下）；X 不变，Y 从屏幕外开始
 *
 * @param {Object} data 卡片数据（包含 rx/ry/rw/rh 字段）
 * @param {number} cw 画布实际宽度（像素）
 * @param {number} ch 画布实际高度（像素）
 * @returns {{ startX: number, startY: number, endX: number, endY: number, w: number, h: number }}
 */
function computePositions(data, cw, ch) {
    // 计算参考坐标系到实际画布的缩放比例
    const scaleX = cw / REF_W;
    const scaleY = ch / REF_H;

    // 将参考尺寸和位置缩放到实际画布
    const w = Math.round(data.rw * scaleX);
    const h = Math.round(data.rh * scaleY);
    const endX = Math.round(data.rx * scaleX);
    const endY = Math.round(data.ry * scaleY);

    // 卡片中心相对于画布中心的偏移，决定飞入方向
    const offX = endX + w / 2 - cw / 2;
    const offY = endY + h / 2 - ch / 2;

    let startX, startY;
    if (Math.abs(offX) > Math.abs(offY)) {
        // 水平方向：X 从屏幕外开始，Y 与终点相同
        startX = offX > 0 ? cw + w : -w;
        startY = endY;
    } else {
        // 垂直方向：Y 从屏幕外开始，X 与终点相同（含 offX=offY=0 → 从上方）
        startX = endX;
        startY = offY > 0 ? ch + h : -h;
    }

    return { startX, startY, endX, endY, w, h };
}



// 飞入动画

// 单张卡片飞入时长（ms）
const ENTER_DURATION = 600;
// 相邻卡片启动间隔（ms）
const STAGGER_MS = 60;

// 清空画布，创建所有卡片并依次执行飞入动画，返回动画完成的 Promise
function buildAndEnterCards(canvas) {
    // 清空画布内的旧卡片元素
    canvas.innerHTML = '';

    // 获取画布实际宽度
    const cw = canvas.clientWidth;
    // 获取画布实际高度
    const ch = canvas.clientHeight;

    // 根据 order 属性排序后再创建 DOM 元素
    const sortedData = MAIN_CARDS_DATA.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const cards = sortedData.map(data => {
        const { startX, startY, endX, endY, w, h } = computePositions(data, cw, ch);

        // 创建卡片元素
        const el = document.createElement('div');
        el.id = data.id;
        el.className = 'card main-card';
        el.innerHTML = data.html;
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        // 初始在屏幕外（飞入起点）
        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.style.opacity = '0';

        canvas.appendChild(el);
        return { el, startX, startY, endX, endY };
    });

    // 第 i 张卡片延迟 i×STAGGER_MS 后启动，产生依次飞入的节奏感
    const promises = cards.map((card, i) =>
        new Promise(resolve => {
            setTimeout(() => {
                runAnimation(ENTER_DURATION, easeOutExpo, et => {
                    card.el.style.left = lerp(card.startX, card.endX, et) + 'px';
                    card.el.style.top = lerp(card.startY, card.endY, et) + 'px';
                    // 前 40% 时间完成淡入，使飞行轨迹清晰可见
                    card.el.style.opacity = Math.min(et / 0.4, 1);
                }).then(resolve);
            }, i * STAGGER_MS);
        })
    );

    loadAllCards();

    return Promise.all(promises);
}

// 飞出动画

// 单张卡片飞出时长（ms）
const EXIT_DURATION = 450;

// 离开主页时将卡片以反向顺序飞出屏幕，返回动画完成的 Promise
function exitCards(canvas) {
    // 获取画布实际宽度
    const cw = canvas.clientWidth;
    // 获取画布实际高度
    const ch = canvas.clientHeight;

    // 反向遍历：最后飞入的卡片最先飞出
    const cardEls = Array.from(canvas.querySelectorAll('.main-card')).reverse();

    const promises = cardEls.map((el, i) =>
        new Promise(resolve => {
            setTimeout(() => {
                // 获取卡片当前位置
                const curX = parseFloat(el.style.left);
                const curY = parseFloat(el.style.top);

                // 通过 id 找到对应数据，复用 computePositions 得到飞出目标（同飞入起点）
                const data = MAIN_CARDS_DATA.find(d => d.id === el.id);
                const { startX, startY } = computePositions(data, cw, ch);

                runAnimation(EXIT_DURATION, easeInExpo, et => {
                    el.style.left = lerp(curX, startX, et) + 'px';
                    el.style.top = lerp(curY, startY, et) + 'px';
                    el.style.opacity = 1 - et;
                }).then(resolve);
            }, i * STAGGER_MS);
        })
    );

    return Promise.all(promises);
}

// 注册主页动画

PAGE_ANIMATIONS['page-main'] = {
    enter(el, forward) {
        // 覆盖 CSS 的 translateX(100%)，使主页显示在可见位置
        el.style.transform = 'translateX(0)';
        return buildAndEnterCards(el.querySelector('#main-canvas'));
    },
    exit(el, forward) {
        return exitCards(el.querySelector('#main-canvas'));
    }
};

// 重绘所有主页卡片
function redrawCards(canvas) {
    if (!canvas) return;
    canvas.innerHTML = '';
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    MAIN_CARDS_DATA.forEach(data => {
        const { endX, endY, w, h } = computePositions(data, cw, ch);
        const el = document.createElement('div');
        el.id = data.id;
        el.className = 'card main-card';
        el.innerHTML = data.html;
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        el.style.left = endX + 'px';
        el.style.top = endY + 'px';
        el.style.opacity = '1';
        canvas.appendChild(el);
    });
    // 主页卡片内容如最新文章等可在此处补充调用
    if (typeof renderLatestArticleCard === 'function') renderLatestArticleCard();

    loadAllCards();
}

// 监听页面尺寸变化，重绘主页卡片
window.addEventListener('resize', () => {
    const page = document.getElementById('page-main');
    if (!page) return;
    const canvas = page.querySelector('#main-canvas');
    redrawCards(canvas);
});