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

// 排除 about_me.md，仅保留正式博客文章
const BLOG_ARTICLES = ARTICLES_DATA.filter(a => a.file !== 'about_me.md');

let randomArticleIndex = Math.floor(Math.random() * BLOG_ARTICLES.length);

// 获取最新文章
function getLatestArticle() {
    return BLOG_ARTICLES[0];
}
// 获取随机文章
function getRandomArticle() {
    return BLOG_ARTICLES[randomArticleIndex];
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
        randomArticleNewIndex = Math.floor(Math.random() * BLOG_ARTICLES.length);
        if (randomArticleNewIndex === randomArticleIndex) {
            randomArticleNewIndex = (randomArticleNewIndex + 1) % BLOG_ARTICLES.length;
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
    // Bilibili
    const bilibiliContent = document.getElementById('mc-bilibili')?.querySelector('.mc-content');
    if (bilibiliContent) {
        bilibiliContent.innerHTML = `<img class="link-icon" src="https://cdn.simpleicons.org/bilibili/white" alt="Bilibili">`;
    }

    // GitHub
    const githubContent = document.getElementById('mc-github')?.querySelector('.mc-content');
    if (githubContent) {
        githubContent.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" fill-rule="evenodd" clip-rule="evenodd"
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        `;
    }

    // 网易云
    const neteaseContent = document.getElementById('mc-netease')?.querySelector('.mc-content');
    if (neteaseContent) {
        neteaseContent.innerHTML = `<img class="link-icon" src="https://cdn.simpleicons.org/neteasecloudmusic/white" alt="网易云音乐">`;
    }

    // 邮箱卡片，左 QQ ，右 Gmail
    const emailContent = document.getElementById('mc-email')?.querySelector('.mc-content');
    if (emailContent) {
        emailContent.innerHTML = `
            <div class="email-card">
                <div class="email-item" id="mc-email-qq">
                    <img class="link-icon" src="https://cdn.simpleicons.org/qq/white" alt="QQ邮箱">
                </div>
                <div class="email-divider"></div>
                <div class="email-item" id="mc-email-gmail">
                    <img class="link-icon" src="https://cdn.simpleicons.org/gmail/white" alt="Gmail">
                </div>
            </div>
        `;
        document.getElementById('mc-email-qq').addEventListener('click', e => {
            e.stopPropagation();
            window.open('https://mail.qq.com', '_blank');
        });
        document.getElementById('mc-email-gmail').addEventListener('click', e => {
            e.stopPropagation();
            window.open('https://mail.google.com', '_blank');
        });
    }

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

// 加载天气卡片：通过浏览器定位获取坐标，调用 Open-Meteo 免费接口
function loadWeatherCard() {
    const card = document.getElementById('mc-weather');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;

    // 用坐标请求 Open-Meteo 并渲染天气卡片内容
    function fetchAndRender(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto&wind_speed_unit=kmh`;
        fetch(url)
            .then(r => r.json())
            .then(data => {
                const cur = data.current;
                // 温度取整
                const temp = Math.round(cur.temperature_2m);
                const humidity = cur.relative_humidity_2m;
                const wind = Math.round(cur.wind_speed_10m);
                // 根据 WMO 天气码获取图标和描述
                const { key, text } = getWeatherInfo(cur.weather_code);
                const svgContent = WEATHER_ICONS[key];
                content.innerHTML = `
                    <div class="weather-card">
                        <div class="weather-main">
                            <svg class="weather-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>
                            <span class="weather-temp">${temp}°C</span>
                        </div>
                        <div class="weather-desc">${text}</div>
                        <div class="weather-extra">
                            <span>湿度 ${humidity}%</span>
                            <span>风 ${wind} km/h</span>
                        </div>
                    </div>
                `;
            })
            .catch(() => {
                content.innerHTML = '<div class="weather-card"><div class="weather-hint">天气获取失败</div></div>';
            });
    }

    // 定位失败时回退到 profile.js 中配置的坐标
    function fallbackToConfig() {
        const loc = PROFILE.location;
        fetchAndRender(loc.latitude.toFixed(4), loc.longitude.toFixed(4));
    }

    content.innerHTML = '<div class="weather-card"><div class="weather-hint">获取天气中...</div></div>';

    // 浏览器不支持定位则直接使用配置坐标
    if (!navigator.geolocation) {
        fallbackToConfig();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude.toFixed(4);
            const lon = pos.coords.longitude.toFixed(4);
            fetchAndRender(lat, lon);
        },
        // 定位被拒绝或超时，回退到配置坐标
        fallbackToConfig,
        { timeout: 5000 }
    );
}

// 加载欢迎卡片
function loadWelcomeCard() {
    const card = document.getElementById('mc-welcome');
    if (!card) return;
    const content = card.querySelector('.mc-content');
    if (!content) return;

    // 有头像路径则使用 img，否则显示姓名首字作为占位
    const avatarHtml = PROFILE.avatar
        ? `<img class="welcome-avatar" src="${PROFILE.avatar}" alt="${PROFILE.name}">`
        : `<div class="welcome-avatar welcome-avatar-placeholder">${PROFILE.name.charAt(0)}</div>`;

    // 将标签数组转为标签 HTML
    const badgesHtml = PROFILE.badges.map(b => `<span class="welcome-badge">${b}</span>`).join('');

    content.innerHTML = `
        <div class="welcome-card">
            ${avatarHtml}
            <div class="welcome-info">
                <div class="welcome-name">${PROFILE.name}</div>
                <div class="welcome-tagline">${PROFILE.tagline}</div>
                <p class="welcome-bio">${PROFILE.bio}</p>
                <div class="welcome-badges">${badgesHtml}</div>
            </div>
        </div>
    `;
}

// 加载所有卡片元素
function loadAllCards(){
    loadWeatherCard();
    loadWelcomeCard();
    loadLatestArticleCard();
    loadRandomArticleCard();
    loadTimeCard();
    loadCalendarCard();
    loadMusicCard();
    loadLinkCards();
    loadAboutCard();
}