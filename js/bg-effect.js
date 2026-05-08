/**
 * 背景动态效果：单个紫色光晕沿 Lissajous 路径缓慢漫游 + 少量白色粒子淡入淡出。
 */

(function () {
    // 创建背景 canvas，插入到 body 最前，position:fixed 铺满视口
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    // 将 canvas 物理像素与视口对齐
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // 光晕时间参数，随机初始相位避免每次刷新都从同一位置开始
    let glowT = Math.random() * 100;

    // 粒子数量
    const PARTICLE_COUNT = 20;

    /**
     * 生成一个粒子对象。
     * @param {boolean} randomAge - true 时随机初始年龄，用于初始化时错开各粒子的生命周期
     */
    function makeParticle(randomAge) {
        const lifespan = 5000 + Math.random() * 8000;
        const fadeTime = 1200 + Math.random() * 800;
        const angle    = Math.random() * Math.PI * 2;
        const speed    = 0.08 + Math.random() * 0.18;
        return {
            x:        Math.random() * canvas.width,
            y:        Math.random() * canvas.height,
            vx:       Math.cos(angle) * speed,
            vy:       Math.sin(angle) * speed,
            r:        0.8 + Math.random() * 1.8,
            peak:     0.25 + Math.random() * 0.45,
            age:      randomAge ? Math.random() * lifespan : 0,
            lifespan,
            fadeTime,
        };
    }

    // 初始化所有粒子，随机分散在各自生命阶段
    const particles = Array.from({ length: PARTICLE_COUNT }, () => makeParticle(true));

    let lastTs = 0;

    function frame(ts) {
        // 帧时长，上限 50ms 防止页面切换/失焦后大步跳跃
        const dt = Math.min(ts - lastTs, 50);
        lastTs = ts;

        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // 光晕：Lissajous 路径（黄金比例频率使路径永不完全重复）
        glowT += dt * 0.000035;
        const gx = (0.5 + 0.38 * Math.sin(glowT))             * W;
        const gy = (0.5 + 0.38 * Math.sin(glowT * 1.618 + 1)) * H;
        const gr = Math.max(W, H) * 0.55;

        const glowGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        glowGrad.addColorStop(0,   'rgba(100, 28, 205, 0.2)');
        glowGrad.addColorStop(0.4, 'rgba(75,  16, 175, 0.1)');
        glowGrad.addColorStop(1,   'rgba(55,  10, 145, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);

        // 粒子更新与绘制
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = particles[i];
            p.age += dt;

            // 生命周期结束后重生
            if (p.age >= p.lifespan) {
                particles[i] = makeParticle(false);
                continue;
            }

            // 淡入段 / 稳定段 / 淡出段
            let alpha;
            if (p.age < p.fadeTime) {
                alpha = p.peak * (p.age / p.fadeTime);
            } else if (p.age > p.lifespan - p.fadeTime) {
                alpha = p.peak * ((p.lifespan - p.age) / p.fadeTime);
            } else {
                alpha = p.peak;
            }

            // 位置更新
            p.x += p.vx;
            p.y += p.vy;

            // 超出边界时从对侧回绕
            if (p.x < -5)      p.x += W + 10;
            else if (p.x > W + 5) p.x -= W + 10;
            if (p.y < -5)      p.y += H + 10;
            else if (p.y > H + 5) p.y -= H + 10;

            // 绘制柔和白色小球：内实外虚的径向渐变
            const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
            pg.addColorStop(0,   `rgba(255,255,255,${alpha})`);
            pg.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.4).toFixed(3)})`);
            pg.addColorStop(1,   'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = pg;
            ctx.fill();
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
