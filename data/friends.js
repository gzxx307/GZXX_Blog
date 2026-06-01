// 友链数据配置，每项结构复用 PROFILE 字段，并额外增加 url 表示跳转链接
const FRIENDS = [
    {
        // 头像图片路径，留空则显示名称首字
        avatar: 'data/head.jpg',
        // 友邻站点名称
        name: '示例友邻',
        // 一句话身份标签
        tagline: '前端开发者 / 设计师',
        // 站点或个人简介
        bio: '热爱开源，乐于分享',
        // 技能/兴趣标签数组
        badges: ['React', 'TypeScript', 'Node.js'],
        // 点击卡片跳转的链接
        url: 'https://example.com'
    }
];
