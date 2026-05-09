/**
 * 图片灯箱：为文章内容中的图片绑定点击放大预览事件。
 */

// 获取覆盖层与预览图片元素（全局唯一，只需查询一次）
const _lightboxOverlay = document.getElementById('lightbox-overlay');
const _lightboxImg = document.getElementById('lightbox-img');

// 打开灯箱：将目标图片的 src 赋给预览图，然后淡入覆盖层
function _openLightbox(src) {
    _lightboxImg.src = src;
    _lightboxOverlay.classList.add('lightbox-visible');
}

// 关闭灯箱：移除激活类，覆盖层淡出
function _closeLightbox() {
    _lightboxOverlay.classList.remove('lightbox-visible');
}

// 点击覆盖层本身（图片以外的区域）关闭灯箱
_lightboxOverlay.addEventListener('click', (e) => {
    // e.target 为覆盖层本身时才关闭，点击图片不触发（图片会冒泡到覆盖层，但 target 是 img）
    if (e.target === _lightboxOverlay) _closeLightbox();
});

// 按 Escape 键关闭灯箱
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') _closeLightbox();
});

// 为 #article-content 内所有图片绑定点击事件，每次文章渲染后调用
function initLightbox() {
    const imgs = document.querySelectorAll('#article-content img');
    imgs.forEach(img => {
        img.addEventListener('click', () => _openLightbox(img.src));
    });
}
