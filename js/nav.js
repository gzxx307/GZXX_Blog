/**
 * 导航栏指示条：在导航链接底部的绿色小横条，随页面切换丝滑移动。
 * 使用 requestAnimationFrame 驱动自定义缓动曲线，产生"后退→加速→过冲→回弹"效果。
 */

// 指示条正常状态下的目标宽度（px）
const _INDICATOR_WIDTH = 24;

// 动画总时长（毫秒）
const _NAV_DURATION = 400;

// 当前正在执行的动画 ID，用于取消上一次未完成的动画
let _navAnimId = null;

// 自定义缓动函数：轻微后退 → 加速前进 → 超过目标 → 回弹定位
// 使用分段组合方式，前半段 easeInBack（包含后退），后半段 easeOutBack（包含过冲）
function navIndicatorEase(t) {
    // 0 ~ 0.35：easeInBack 阶段（轻微后退后加速出发），值域 [0, 0.4]
    // 0.35 ~ 1.0：easeOutBack 阶段（过冲后回弹定位），值域 [0.4, 1.0]
    var s1 = 1.4; // 前半段后退强度
    var s2 = 1.6; // 后半段过冲强度

    if (t < 0.35) {
        var p = t / 0.35; // 映射到 [0, 1]
        return 0.4 * ((s1 + 1) * p - s1) * p * p;
    } else {
        var p = (t - 0.35) / 0.65; // 映射到 [0, 1]
        return 0.4 + 0.6 * (1 + (s2 + 1) * Math.pow(p - 1, 3) + s2 * Math.pow(p - 1, 2));
    }
}

// 更新导航栏高亮与指示条位置
// animate 为 false 时直接定位，不播放动画（用于初始加载和窗口缩放）
function updateNavIndicator(pageId, animate) {
    if (animate === undefined) animate = true;

    // 取消上一次未完成的动画
    if (_navAnimId !== null) {
        cancelAnimationFrame(_navAnimId);
        _navAnimId = null;
    }

    // 移除所有链接的激活状态
    document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.classList.remove('active');
    });

    // 找到目标链接
    var toLink = document.querySelector('.nav-links a[data-page="' + pageId + '"]');
    var indicator = document.querySelector('.nav-indicator');
    if (!indicator) return;

    // 主页没有对应链接，隐藏指示条
    if (!toLink) {
        indicator.style.opacity = '0';
        return;
    }

    // 标记目标链接为激活
    toLink.classList.add('active');

    // 计算目标链接中心在 .nav-links-wrapper 坐标系下的 X 坐标
    var navRect = document.querySelector('.nav-links-wrapper').getBoundingClientRect();
    var linkRect = toLink.getBoundingClientRect();
    var targetCenter = linkRect.left - navRect.left + linkRect.width / 2;
    var HALF = _INDICATOR_WIDTH / 2;
    var targetLeft = targetCenter - HALF;

    // 缓存起始 left 值，若无法解析则直接从目标位置开始
    var startLeft = parseFloat(indicator.style.left);
    if (isNaN(startLeft)) startLeft = targetLeft;

    if (!animate) {
        // 无动画模式：直接定位
        indicator.style.left = targetLeft + 'px';
        indicator.style.width = _INDICATOR_WIDTH + 'px';
        indicator.style.opacity = '1';
        return;
    }

    // 有动画模式：使用 requestAnimationFrame 驱动自定义缓动
    var startTime = performance.now();

    function frame(now) {
        var elapsed = now - startTime;
        var t = Math.min(elapsed / _NAV_DURATION, 1);
        var eased = navIndicatorEase(t);

        // 根据缓动值在起始位置和目标位置之间插值
        indicator.style.left = (startLeft + (targetLeft - startLeft) * eased) + 'px';
        indicator.style.width = _INDICATOR_WIDTH + 'px';
        indicator.style.opacity = '1';

        if (t < 1) {
            _navAnimId = requestAnimationFrame(frame);
        } else {
            _navAnimId = null;
        }
    }

    _navAnimId = requestAnimationFrame(frame);
}
