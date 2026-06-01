/**
 * 友链页面渲染：根据 FRIENDS 数据生成友链卡片列表。
 */

// 加载友链页面：读取 FRIENDS 数组，为每个友链生成卡片 DOM
function loadFriendsPage() {
    // 获取友链列表容器
    const list = document.getElementById('friends-list');
    if (!list) return;

    // 清空已有内容，防止重复渲染
    list.innerHTML = '';

    // 遍历友链数据，逐条生成卡片
    FRIENDS.forEach(friend => {
        // 创建卡片容器，使用 .card 基类获取毛玻璃样式
        const card = document.createElement('div');
        card.className = 'card friend-card';

        // 有头像路径则使用 img，否则显示名称首字作为占位
        const avatarHtml = friend.avatar
            ? `<img class="friend-avatar" src="${friend.avatar}" alt="${friend.name}">`
            : `<div class="friend-avatar friend-avatar-placeholder">${friend.name.charAt(0)}</div>`;

        // 将标签数组转为标签 HTML
        const badgesHtml = friend.badges.map(b => `<span class="friend-badge">${b}</span>`).join('');

        // 填充卡片内部 HTML
        card.innerHTML = `
            <div class="friend-card-inner">
                ${avatarHtml}
                <div class="friend-name">${friend.name}</div>
                <div class="friend-tagline">${friend.tagline}</div>
                <p class="friend-bio">${friend.bio}</p>
                <div class="friend-badges">${badgesHtml}</div>
            </div>
        `;

        // 点击卡片在新标签页打开友链
        card.addEventListener('click', () => {
            window.open(friend.url, '_blank');
        });

        // 将卡片追加到列表容器
        list.appendChild(card);
    });
}
