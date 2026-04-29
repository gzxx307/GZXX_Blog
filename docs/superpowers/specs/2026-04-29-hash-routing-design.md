# Hash 路由设计文档

## 背景

博客为纯 SPA，所有"页面"是 `<section>` 元素的显示切换，URL 始终固定。目标：让每个页面、每篇文章都有唯一 URL，支持刷新保持状态、复制链接直达、浏览器前进/后退正常工作。

部署方式：GitHub Pages（静态托管），因此使用 Hash 路由（不需要服务器重定向配置）。

---

## Hash 方案

| 页面 | Hash |
|------|------|
| 主页 | `#/` |
| 文章列表 | `#/article` |
| 文章详情 | `#/article/:slug`（slug = 文件名去掉 `.md`，例如 `docker.md` → `#/article/docker`） |
| 作品 | `#/projects` |
| 关于 | `#/about` |

---

## 改动范围

涉及三个文件：`js/router.js`、`js/article.js`、`js/main.js`。不新增文件，不改动 CSS 和动画注册表。

---

## 各文件改动设计

### `js/router.js`

**新增变量：**

- `let _currentArticleSlug = null` — 当前打开文章的 slug，由 `article.js` 在调用 `navigateTo` 前写入，供构建 hash 使用。
- `let _programmaticHash = false` — 标志位，防止"代码改 hash → 触发 `hashchange` → 再次调导航"的死循环。

**新增函数：**

- `_buildHash(pageId)` — 将页面 ID 转为 hash 字符串。`page-article-detail` 时拼接 `_currentArticleSlug`。
- `_setHash(pageId)` — 置 `_programmaticHash = true`，写入 `window.location.hash`，再用 `setTimeout(0)` 异步重置标志（`hashchange` 事件在同步写入 hash 后异步触发，`setTimeout(0)` 确保标志在事件回调执行前仍为 true）。
- `_parseHash()` — 解析 `window.location.hash`，返回 `{ pageId, articleSlug }`。

**改动 `navigateTo(targetId, silent = false)`：**

- 在验证目标合法后，调用 `_setHash(targetId)` 更新 URL。
- `silent = true` 时：直接切换 `active` class 并清空内联样式，跳过动画和 `isAnimating` 锁，专用于初始化。
- `silent = false` 时：原有动画流程完全不变。

**新增 `hashchange` 监听器：**

```
hashchange 触发
├── _programmaticHash 为 true → 忽略（代码自己改的 hash）
├── isAnimating 为 true → 调 _setHash(当前激活页 id)，恢复 hash，阻止 URL/页面状态不同步
└── 解析 hash
    ├── 文章详情 → 调 restoreArticle(articleSlug)（渲染内容、设 slug），再调 navigateTo('page-article-detail')（带动画）
    └── 其他页面 → 调 navigateTo(pageId)
```

---

### `js/article.js`

**拆分 `openArticle()`：**

提取 `_renderArticleContent(article)` — 只负责将 tags 和 markdown 写入 DOM，不做导航。

**改动 `openArticle(article)`：**

1. 调 `_renderArticleContent(article)` 渲染内容
2. 将 `_currentArticleSlug` 赋值为 `article.file.replace('.md', '')`
3. 调 `navigateTo('page-article-detail')`（与现在相同，hash 由 router 内部构建）

**新增 `restoreArticle(slug)`（全局函数）：**

- 在 `ARTICLES_DATA` 中按 `file` 字段查找 `slug + '.md'`
- 找到：调 `_renderArticleContent(article)`，设 `_currentArticleSlug = slug`
- 找不到：回退，`navigateTo('page-article')`（不继续后续导航）

---

### `js/main.js`

**改动初始化逻辑：**

`loadArticleList()` 和 `loadAboutPage()` 保持不变（必须先执行，`restoreArticle` 依赖 `ARTICLES_DATA`）。

主页动画改为条件触发：

```
解析当前 hash
├── page-main 或 hash 为空
│   └── 播放主页入场动画（现有行为）
├── page-article-detail
│   ├── restoreArticle(slug) — 渲染内容并设 slug
│   └── navigateTo('page-article-detail', true) — 静默切换，不播放动画
└── 其他页面
    └── navigateTo(pageId, true) — 静默切换，不播放动画
```

静默切换只操作 CSS class，不触发动画系统，因此不会出现主页一闪而过的问题。

---

## 动画系统兼容性说明

- **正常导航**：`navigateTo()` 的动画流程完全不变，hash 更新在动画开始前完成。
- **浏览器后退（动画进行中）**：`hashchange` 检测到 `isAnimating = true`，立即恢复 hash，阻止状态不同步。
- **初始化**：使用 `silent = true` 绕过动画系统，直接操作 class，不引入动画锁竞争。
- **`el.style.cssText = ''` 清理**：静默切换同样执行清理，确保 CSS 完全接管样式。
