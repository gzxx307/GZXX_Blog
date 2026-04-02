// 主页

// 字段：id — DOM 元素 id，html — 卡片内 HTML，rx/ry — 左上角坐标（px），rw/rh — 卡片尺寸（px）
const MAIN_CARDS_DATA = [
    // Row 1
    // 欢迎
    {
        id: 'mc-welcome',
        html: '<div class="mc-content"></div><span class="mc-label">欢迎</span>',
        rx: 16,   ry: 16,  rw: 300, rh: 260,
        order: 3
    },
    // 时间
    {
        id: 'mc-time',
        html: '<div class="mc-content"></div><span class="mc-label">时间</span>',
        rx: 326,  ry: 16,  rw: 200, rh: 125,
        order: 2
    },
    // 天气
    {
        id: 'mc-weather',
        html: '<div class="mc-content"></div><span class="mc-label">天气</span>',
        rx: 326,  ry: 151, rw: 200, rh: 125,
        order: 1
    },
    // 日历
    {
        id: 'mc-calendar',
        html: '<div class="mc-content"></div><span class="mc-label">日历</span>',
        rx: 536,  ry: 16,  rw: 280, rh: 260,
        order: 4
    },
    // 音乐播放器（网易云）
    {
        id: 'mc-music',
        html: '<div class="mc-content"></div><span class="mc-label">音乐播放器</span>',
        rx: 826,  ry: 16,  rw: 358, rh: 260,
        order: 5
    },

    // Row 2
    // 关于
    {
        id: 'mc-about',
        html: '<div class="mc-content"></div><span class="mc-label">关于</span>',
        rx: 16,   ry: 286, rw: 150, rh: 188,
        order: 8
    },
    // 最新文章
    {
        id: 'mc-articles',
        html: '<div class="mc-content"></div><span class="mc-label">最新文章</span>',
        rx: 176,  ry: 286, rw: 360, rh: 188,
        order: 6
    },
    // 随机推荐文章
    {
        id: 'mc-recommend',
        html: '<div class="mc-content"></div><span class="mc-label">随机推荐</span>',
        rx: 546,  ry: 286, rw: 260, rh: 188,
        order: 7
    },
    // 平台链接 2×2（B站、GitHub、网易云、邮箱）
    {
        id: 'mc-bilibili',
        html: '<div class="mc-content"></div><span class="mc-label">Bilibili</span>',
        rx: 816,  ry: 286, rw: 179, rh: 89,
        order: 9
    },
    {
        id: 'mc-github',
        html: '<div class="mc-content"></div><span class="mc-label">GitHub</span>',
        rx: 1005, ry: 286, rw: 179, rh: 89,
        order: 11
    },
    {
        id: 'mc-netease',
        html: '<div class="mc-content"></div><span class="mc-label">网易云音乐</span>',
        rx: 816,  ry: 385, rw: 179, rh: 89,
        order: 10
    },
    {
        id: 'mc-email',
        html: '<div class="mc-content"></div><span class="mc-label">邮箱</span>',
        rx: 1005, ry: 385, rw: 179, rh: 89,
        order: 12
    },

    // Row 3
    // 额外卡片（占位用，后续可改为其他内容）
    {
        id: 'mc-extra-a',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 16,   ry: 484, rw: 380, rh: 200,
        order: 13
    },
    {
        id: 'mc-extra-b',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 406,  ry: 484, rw: 520, rh: 200,
        order: 14
    },
    {
        id: 'mc-extra-c',
        html: '<div class="mc-content"></div><span class="mc-label"></span>',
        rx: 936,  ry: 484, rw: 248, rh: 200,
        order: 15
    },
];

let randomArticleIndex = Math.floor(Math.random() * ARTICLES_DATA.length);

// 获取最新文章
function getLatestArticle() {
    return ARTICLES_DATA[0];
}
// 获取随机文章
function getRandomArticle() {
    // 从全局 ARTICLES_DATA 中随机选择一篇文章
    return ARTICLES_DATA[randomArticleIndex];
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
        // 如果随机到相同文章则切换到下一文章，保证刷新不重复
        randomArticleNewIndex = Math.floor(Math.random() * ARTICLES_DATA.length);
        if (randomArticleNewIndex === randomArticleIndex) {
            randomArticleNewIndex = (randomArticleNewIndex + 1) % ARTICLES_DATA.length;
        }
        randomArticleIndex = randomArticleNewIndex;

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

// 加载音乐播放器卡片
function loadMusicCard() {
    const card = document.getElementById('mc-music');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;

    let currentIndex = 0;
    let isPlaying = false;
    const audio = new Audio();

    // 播放器骨架 HTML
    content.innerHTML = `
        <div class="music-player">
            <div class="music-cover-wrap">
                <div class="music-cover" id="mc-cover-img">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18V5l12-2v13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="6" cy="18" r="3" stroke="white" stroke-width="1.5"/>
                        <circle cx="18" cy="16" r="3" stroke="white" stroke-width="1.5"/>
                    </svg>
                </div>
            </div>
            <div class="music-info">
                <div class="music-title" id="mc-title"></div>
                <div class="music-artist" id="mc-artist"></div>
                <div class="music-progress-wrap">
                    <div class="music-bar" id="mc-bar">
                        <div class="music-bar-fill" id="mc-fill"></div>
                    </div>
                    <div class="music-time">
                        <span id="mc-cur">0:00</span>
                        <span id="mc-total">0:00</span>
                    </div>
                </div>
                <div class="music-controls">
                    <button class="music-btn" id="mc-prev" aria-label="上一首">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                            <path d="M19 20L9 12l10-8v16z"/>
                            <rect x="5" y="4" width="2.5" height="16" rx="1"/>
                        </svg>
                    </button>
                    <button class="music-btn music-play-btn" id="mc-play" aria-label="播放">
                        <svg id="mc-play-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button class="music-btn" id="mc-next" aria-label="下一首">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                            <path d="M5 4l10 8-10 8V4z"/>
                            <rect x="16.5" y="4" width="2.5" height="16" rx="1"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // 获取到各个元素的引用
    const coverEl = content.querySelector('#mc-cover-img');
    const titleEl = content.querySelector('#mc-title');
    const artistEl = content.querySelector('#mc-artist');
    const barEl = content.querySelector('#mc-bar');
    const fillEl = content.querySelector('#mc-fill');
    const curEl = content.querySelector('#mc-cur');
    const totalEl = content.querySelector('#mc-total');
    const playIconEl = content.querySelector('#mc-play-icon');

    // 秒数格式化为 m:ss
    function fmtTime(sec) {
        if (!isFinite(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = String(Math.floor(sec % 60)).padStart(2, '0');
        return `${m}:${s}`;
    }

    // 将指定索引的曲目信息渲染到界面
    function loadTrack(index) {
        const track = PLAYLIST[index];
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        audio.src = track.src;
        // 有封面图则作为背景，隐藏默认音符 SVG
        const iconSvg = coverEl.querySelector('svg');
        if (track.cover) {
            coverEl.style.backgroundImage = `url(${track.cover})`;
            iconSvg.style.display = 'none';
        } else {
            coverEl.style.backgroundImage = '';
            iconSvg.style.display = '';
        }
        fillEl.style.width = '0%';
        curEl.textContent = '0:00';
        totalEl.textContent = '0:00';
    }

    // 切换播放状态，同步图标和封面旋转动画
    function setPlaying(playing) {
        isPlaying = playing;
        if (playing) {
            audio.play().catch(() => {});
            coverEl.classList.add('playing');
            // 暂停图标：两个竖条
            playIconEl.setAttribute('viewBox', '0 0 24 24');
            playIconEl.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
        } else {
            audio.pause();
            coverEl.classList.remove('playing');
            // 播放图标：三角形
            playIconEl.setAttribute('viewBox', '0 0 24 24');
            playIconEl.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }
    }

    // 播放/暂停切换
    content.querySelector('#mc-play').addEventListener('click', e => {
        e.stopPropagation();
        setPlaying(!isPlaying);
    });

    // 上一首
    content.querySelector('#mc-prev').addEventListener('click', e => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
        loadTrack(currentIndex);
        if (isPlaying) setPlaying(true);
    });

    // 下一首
    content.querySelector('#mc-next').addEventListener('click', e => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % PLAYLIST.length;
        loadTrack(currentIndex);
        if (isPlaying) setPlaying(true);
    });

    // 点击进度条跳转到对应位置
    barEl.addEventListener('click', e => {
        e.stopPropagation();
        if (!audio.duration) return;
        const rect = barEl.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
    });

    // 播放进度更新：同步进度条与当前时间
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        fillEl.style.width = (audio.currentTime / audio.duration * 100) + '%';
        curEl.textContent = fmtTime(audio.currentTime);
    });

    // 元数据加载完成后更新总时长
    audio.addEventListener('loadedmetadata', () => {
        totalEl.textContent = fmtTime(audio.duration);
    });

    // 播放结束后自动切换下一首
    audio.addEventListener('ended', () => {
        currentIndex = (currentIndex + 1) % PLAYLIST.length;
        loadTrack(currentIndex);
        setPlaying(true);
    });

    loadTrack(currentIndex);
}
// 加载平台链接卡片内容并注册点击事件
function loadLinkCards(){
    // 创建链接卡片内容
    const emailCard = document.getElementById('mc-email');
    if (!emailCard) return;
    const emailContent = emailCard.querySelector('.mc-content');
    if (!emailContent) return;
    emailContent.innerHTML = `
        <div class="link-card">
            <p>QQ：3581544162@qq.com</p>
            <p>Gmail：gzxx307@gmail.com</p>
        </div>
    `;

    registerLinkCards();
}
// 注册平台链接卡片的点击事件
function registerLinkCards(){
    const bilibiliCard = document.getElementById('mc-bilibili');
    if (bilibiliCard) {
        bilibiliCard.addEventListener('click', () => {
            window.open('https://space.bilibili.com/372575779', '_blank');
        });
    }
    const githubCard = document.getElementById('mc-github');
    if (githubCard) {
        githubCard.addEventListener('click', () => {
            window.open('https://github.com/gzxx307', '_blank');
        });
    }
    const neteaseCard = document.getElementById('mc-netease');
    if (neteaseCard) {
        neteaseCard.addEventListener('click', () => {
            window.open('https://music.163.com/#/artist?id=35879730', '_blank');
        });
    }
}

// 加载关于卡片
function loadAboutCard() {
    const card = document.getElementById('mc-about');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;
    content.innerHTML = `
        <div class="about-card">
            <h1>关于我</h1>
            <p>你想知道的一切</p>
        </div>
    `;

    card.addEventListener('click', () => {
        navigateTo('page-about');
    });
}

// 加载欢迎卡片
function loadWelcomeCard() {
    const card = document.getElementById('mc-welcome');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;
}

// 加载所有卡片元素
function loadAllCards(){
    loadLatestArticleCard();
    loadRandomArticleCard();
    loadTimeCard();
    loadCalendarCard();
    loadMusicCard();
    loadLinkCards();
    loadAboutCard();
}