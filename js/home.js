// 主页

// 字段：id — DOM 元素 id，html — 卡片内 HTML，rx/ry — 左上角坐标（px），rw/rh — 卡片尺寸（px）
const MAIN_CARDS_DATA = [
    // Row 1
    // 欢迎
    {
        id: 'mc-welcome',
        html: '<div class="mc-content"></div><span class="mc-label">欢迎</span>',
        rx: 16,   ry: 16,  rw: 300, rh: 260
    },
    // 时间
    {
        id: 'mc-time',
        html: '<div class="mc-content"></div><span class="mc-label">时间</span>',
        rx: 326,  ry: 16,  rw: 200, rh: 125
    },
    // 天气
    {
        id: 'mc-weather',
        html: '<div class="mc-content"></div><span class="mc-label">天气</span>',
        rx: 326,  ry: 151, rw: 200, rh: 125
    },
    // 日历
    {
        id: 'mc-calendar',
        html: '<div class="mc-content"></div><span class="mc-label">日历</span>',
        rx: 536,  ry: 16,  rw: 280, rh: 260
    },
    // 音乐播放器（网易云）
    {
        id: 'mc-music',
        html: '<div class="mc-content"></div><span class="mc-label">音乐播放器</span>',
        rx: 826,  ry: 16,  rw: 358, rh: 260
    },

    // Row 2
    // 关于
    {
        id: 'mc-about',
        html: '<div class="mc-content"></div><span class="mc-label">关于</span>',
        rx: 16,   ry: 286, rw: 150, rh: 188
    },
    // 最新文章
    {
        id: 'mc-articles',
        html: '<div class="mc-content"></div><span class="mc-label">最新文章</span>',
        rx: 176,  ry: 286, rw: 360, rh: 188
    },
    // 随机推荐文章
    {
        id: 'mc-recommend',
        html: '<div class="mc-content"></div><span class="mc-label">随机推荐</span>',
        rx: 546,  ry: 286, rw: 260, rh: 188
    },
    // 平台链接 2×2（B站、GitHub、网易云、邮箱）
    {
        id: 'mc-bilibili',
        html: '<div class="mc-content"></div><span class="mc-label">Bilibili</span>',
        rx: 816,  ry: 286, rw: 179, rh: 89
    },
    {
        id: 'mc-github',
        html: '<div class="mc-content"></div><span class="mc-label">GitHub</span>',
        rx: 1005, ry: 286, rw: 179, rh: 89
    },
    {
        id: 'mc-netease',
        html: '<div class="mc-content"></div><span class="mc-label">网易云音乐</span>',
        rx: 816,  ry: 385, rw: 179, rh: 89
    },
    {
        id: 'mc-email',
        html: '<div class="mc-content"></div><span class="mc-label">邮箱</span>',
        rx: 1005, ry: 385, rw: 179, rh: 89
    },

    // Row 3
    // 额外卡片（占位用，后续可改为其他内容）
    {
        id: 'mc-extra-a',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 16,   ry: 484, rw: 380, rh: 200
    },
    {
        id: 'mc-extra-b',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 406,  ry: 484, rw: 520, rh: 200
    },
    {
        id: 'mc-extra-c',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 936,  ry: 484, rw: 248, rh: 200
    },
];


// 获取最新文章
function getLatestArticle() {
    return ARTICLES_DATA[0];
}
// 获取随机文章
function getRandomArticle() {
    // 从全局 ARTICLES_DATA 中随机选择一篇文章
    const randomIndex = Math.floor(Math.random() * ARTICLES_DATA.length);
    return ARTICLES_DATA[randomIndex];
}

// 加载最新文章到主页卡片
function loadLatestArticleCard() {
    const latest = getLatestArticle();
    const card = document.getElementById('mc-articles');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;
    // 将 tags 数组转为标签 HTML
    const latestTagsHtml = latest.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    content.innerHTML = `
        <div class="latest-article-card">
            <h3 class="latest-article-title">${latest.title}</h3>
            <span class="latest-article-date">${latest.date}</span>
            <p class="latest-article-excerpt">${latest.excerpt}</p>
            <div class="article-tags">${latestTagsHtml}</div>
        </div>
    `;
    // 点击跳转到文章详情
    card.addEventListener('click', () => openArticle(latest));
}
// 加载随机推荐文章到主页卡片
function loadRandomArticleCard() {
    const random = getRandomArticle();
    const card = document.getElementById('mc-recommend');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;
    // 将 tags 数组转为标签 HTML
    const randomTagsHtml = random.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    // 用SVG绘制刷新图标
    content.innerHTML = `
        <div class="random-article-card">
            <div class="random-card-header">
                <h3 class="random-article-title">${random.title}</h3>
                <button class="random-refresh-btn" aria-label="换一篇">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="23 4 23 10 17 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <span class="random-article-date">${random.date}</span>
            <p class="random-article-excerpt">${random.excerpt}</p>
            <div class="article-tags">${randomTagsHtml}</div>
        </div>
    `;
    // 刷新按钮：重新随机一篇，阻止冒泡以避免触发卡片跳转
    content.querySelector('.random-refresh-btn').addEventListener('click', e => {
        e.stopPropagation();
        loadRandomArticleCard();
    });
    // 点击卡片跳转到文章详情
    card.addEventListener('click', () => openArticle(random));
}
// 加载时间卡片
function loadTimeCard() {
    const card = document.getElementById('mc-time');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;

    // 星期中文名称
    const WEEKDAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    // 插入时间卡片结构
    content.innerHTML = `
        <div class="time-card">
            <div class="time-main"></div>
            <div class="time-seconds"></div>
            <div class="time-weekday"></div>
        </div>
    `;

    const mainEl = content.querySelector('.time-main');
    const secEl = content.querySelector('.time-seconds');
    const weekEl = content.querySelector('.time-weekday');

    function updateTime() {
        const now = new Date();
        // 格式化时、分、秒，不足两位补零
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        mainEl.textContent = `${h}:${m}`;
        secEl.textContent = s;
        weekEl.textContent = WEEKDAY_NAMES[now.getDay()];
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// 加载日历卡片
function loadCalendarCard() {
    const card = document.getElementById('mc-calendar');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;

    const now = new Date();
    const year = now.getFullYear();
    // getMonth() 返回 0-11
    const month = now.getMonth();
    const today = now.getDate();

    // 该月第一天是星期几（0=日）
    const firstWeekday = new Date(year, month, 1).getDay();
    // 该月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月',
                         '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

    // 构建星期标题行
    const weekdaysHtml = WEEKDAY_LABELS
        .map(w => `<span class="calendar-weekday">${w}</span>`)
        .join('');

    // 构建日期格子，月初前补空占位
    let cellsHtml = '';
    for (let i = 0; i < firstWeekday; i++) {
        cellsHtml += '<span class="calendar-day empty"></span>';
    }
    for (let d = 1; d <= daysInMonth; d++) {
        // 今天加 today 类
        const cls = d === today ? 'calendar-day today' : 'calendar-day';
        cellsHtml += `<span class="${cls}">${d}</span>`;
    }

    content.innerHTML = `
        <div class="calendar-card">
            <div class="calendar-header">${year}年 ${MONTH_NAMES[month]}</div>
            <div class="calendar-weekdays">${weekdaysHtml}</div>
            <div class="calendar-grid">${cellsHtml}</div>
        </div>
    `;
}

// 加载所有卡片元素
function loadAllCards(){
    loadLatestArticleCard();
    loadRandomArticleCard();
    loadTimeCard();
    loadCalendarCard();
}