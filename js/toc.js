/**
 * 文章目录（TOC）：提取标题、生成嵌套列表、平滑滚动、滚动激活跟踪。
 */

// 当前注册在滚动容器上的 scroll 事件处理函数，destroyToc 时用于移除
let _scrollHandler = null;

// 将标题文本转为合法的 HTML id（保留中文/英文/数字，其余转连字符）
function _slugify(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w一-龥-]/g, '')
        .replace(/-+/g, '-');
}

// easeInOutCubic 缓动函数：t 为 0~1 的进度比
function _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * 在指定滚动容器内，将滚动位置平滑移动到目标 y 坐标。
 * @param {Element} container - 滚动容器（overflow-y: auto 的元素）
 * @param {number} targetY - 目标 scrollTop 值
 * @param {number} duration - 动画时长（ms）
 */
function _smoothScrollTo(container, targetY, duration) {
    const startY = container.scrollTop;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(currentTime) {
        // 计算已经过去的时间比例
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // 应用缓动函数得到当前帧的滚动位置
        container.scrollTop = startY + distance * _easeInOutCubic(progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/**
 * 从 #article-content 提取 h1~h3，注入 id，构建嵌套 ol 结构填入 #toc-nav。
 * @returns {Array} headings - [{el, id, level}, ...] 用于滚动跟踪
 */
function _buildToc() {
    const content = document.getElementById('article-content');
    const nav = document.getElementById('toc-nav');
    // 清空旧内容，防止切换文章时重复叠加
    nav.innerHTML = '';

    // 收集所有 h1~h3 标题元素
    const rawHeadings = Array.from(content.querySelectorAll('h1, h2, h3'));
    if (rawHeadings.length === 0) return [];

    // 为每个标题注入唯一 id，并记录层级信息
    const headings = rawHeadings.map((el, index) => {
        const level = parseInt(el.tagName[1]);
        const id = _slugify(el.textContent) + '-' + index;
        el.id = id;
        return { el, id, level };
    });

    // 构建嵌套列表
    // rootList 是最顶层的 ol，stack 维护当前各层级的 ol 容器
    const rootList = document.createElement('ol');
    rootList.className = 'toc-list';

    // stack[i] 存放第 i 层（从1开始）的 ol 元素
    const stack = [];
    // 记录最后插入的 li，子列表需要追加到它内部
    let lastLi = null;

    headings.forEach(({ id, level, el }) => {
        // 弹出比当前层级深的栈项，保持层级正确
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        // 当前层级的父 ol：若栈为空则用 rootList，否则在上一层 li 内创建子 ol
        let parentOl;
        if (stack.length === 0) {
            parentOl = rootList;
        } else {
            const parentFrame = stack[stack.length - 1];
            // 若上一层 li 还没有子 ol，则创建一个
            if (!parentFrame.childOl) {
                const childOl = document.createElement('ol');
                childOl.className = 'toc-list toc-child';
                parentFrame.li.appendChild(childOl);
                parentFrame.childOl = childOl;
            }
            parentOl = parentFrame.childOl;
        }

        // 创建 li 和 a
        const li = document.createElement('li');
        li.className = 'toc-item toc-level-' + level;

        const a = document.createElement('a');
        a.className = 'toc-link';
        a.href = '#' + id;
        a.title = el.textContent;

        const dot = document.createElement('span');
        dot.className = 'toc-dot';

        const span = document.createElement('span');
        span.className = 'toc-text';
        span.textContent = el.textContent;

        a.appendChild(dot);
        a.appendChild(span);
        li.appendChild(a);
        parentOl.appendChild(li);

        lastLi = li;
        // 将当前层级信息压栈
        stack.push({ level, li, childOl: null });
    });

    nav.appendChild(rootList);
    return headings;
}

/**
 * 激活对应索引的 TOC 链接，并将其滚动到面板可视区中央。
 * @param {NodeList} links - 所有 .toc-link 元素
 * @param {number} index - 要激活的链接下标
 */
function _activateLink(links, index) {
    const target = links[index];
    if (!target) return;
    // 已经是当前激活项则跳过，避免不必要的 DOM 操作
    if (target.classList.contains('active-current')) return;

    // 清除所有激活状态
    links.forEach(link => link.classList.remove('active', 'active-current'));

    // 激活当前项
    target.classList.add('active', 'active-current');

    // 激活所有祖先项（li 的父链中找 .toc-link）
    let node = target.parentElement;
    while (node && node.id !== 'toc-nav') {
        if (node.tagName === 'LI') {
            const parentLink = node.parentElement?.previousElementSibling;
            if (parentLink && parentLink.classList.contains('toc-link')) {
                parentLink.classList.add('active');
            }
        }
        node = node.parentElement;
    }

    // 将激活项滚动到 toc-panel 可视区中央
    const panel = document.getElementById('toc-panel');
    if (!panel) return;
    const panelRect = panel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const distanceToCenter = targetRect.top - panelRect.top - panel.offsetHeight / 2 + target.offsetHeight / 2;
    panel.scrollTop += distanceToCenter;
}

// 初始化 TOC，在文章内容渲染完成后调用
function initToc() {
    const headings = _buildToc();
    // 无标题则不显示 TOC 容器
    const container = document.getElementById('toc-container');
    if (headings.length === 0) {
        container.style.display = 'none';
        return;
    }
    // 显式设为 block，不能用 '' 回退——HTML 内联 style 默认值是 none
    container.style.display = 'block';

    // 收集所有生成的 .toc-link 元素
    const links = document.querySelectorAll('#toc-nav .toc-link');

    // 滚动容器：.page 元素本身是 overflow-y:auto 的滚动区
    const scrollEl = document.getElementById('page-article-detail');

    // 点击 TOC 链接：拦截默认跳转，改为平滑滚动
    links.forEach((link, i) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            // 目标元素相对滚动容器的 offsetTop
            const containerTop = scrollEl.getBoundingClientRect().top;
            const targetTop = targetEl.getBoundingClientRect().top;
            const targetScrollTop = scrollEl.scrollTop + (targetTop - containerTop) - 80;
            _smoothScrollTo(scrollEl, targetScrollTop, 500);
            // 关闭窄屏目录面板
            document.getElementById('toc-panel').classList.remove('toc-open');
        });
    });

    // 滚动时更新激活项
    _scrollHandler = () => {
        const containerTop = scrollEl.getBoundingClientRect().top;
        // 找第一个顶部还在视口 80px 以下的标题，激活其前一个
        let activeIndex = headings.findIndex(({ el }) => {
            return el.getBoundingClientRect().top - containerTop - 80 > 0;
        });
        if (activeIndex === -1) {
            activeIndex = headings.length - 1;
        } else if (activeIndex > 0) {
            activeIndex -= 1;
        }
        _activateLink(links, activeIndex);
    };
    scrollEl.addEventListener('scroll', _scrollHandler);

    // 页面加载后立即执行一次，激活初始位置
    _scrollHandler();

    // 窄屏切换按钮
    const toggleBtn = document.getElementById('toc-toggle-btn');
    const panel = document.getElementById('toc-panel');
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('toc-open');
    });
}

// 销毁 TOC，在离开文章详情页时调用，防止内存泄漏
function destroyToc() {
    const scrollEl = document.getElementById('page-article-detail');
    if (_scrollHandler) {
        scrollEl.removeEventListener('scroll', _scrollHandler);
        _scrollHandler = null;
    }
    // 隐藏容器
    const container = document.getElementById('toc-container');
    if (container) container.style.display = 'none';
    // 收起窄屏面板
    const panel = document.getElementById('toc-panel');
    if (panel) panel.classList.remove('toc-open');
    // 清空标签区
    const tags = document.getElementById('toc-tags');
    if (tags) tags.innerHTML = '';
}
