(function() {
    'use strict';

    // ========== 配置 ==========
    const ROTATE_FACTOR = 0.006;       // 旋转灵敏度
    const CENTER_RADIUS_RATIO = 0.18;  // 中心区域半径占 spinner 宽度比例
    const INERTIA_DECAY_ROT = 0.97;    // 旋转惯性衰减
    const INERTIA_DECAY_POS = 0.95;    // 平移惯性衰减（略高一点，让惯性更顺滑）
    const MIN_SPEED = 0.002;           // 停止阈值

    // ========== DOM ==========
    const spinner = document.getElementById('spinner');

    // ========== 状态 ==========
    let isDragging = false;
    let mode = null;               // 'rotate' 或 'translate'
    let prevX = 0, prevY = 0;
    let rotVelocity = 0;           // 角速度 (rad/ms)
    let transVelocityX = 0, transVelocityY = 0; // 平移速度 (px/ms)
    let angle = 0;                 // 当前旋转角度 (rad)
    let posX = 0, posY = 0;        // 当前平移偏移 (px)
    let lastTimestamp = 0;
    let animId = null;

    // ========== 工具函数 ==========
    function getPointerXY(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    // 判断点是否在 spinner 的中心区域内
    function isInCenter(clientX, clientY) {
        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width * CENTER_RADIUS_RATIO;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        return (dx * dx + dy * dy) <= radius * radius;
    }

    // 获取当前允许的平移边界（保证 spinner 完全在视口内）
    function getBoundaries() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const sw = spinner.offsetWidth;
        const sh = spinner.offsetHeight;

        // spinner 初始居中时的左上角坐标
        const initLeft = (vw - sw) / 2;
        const initTop = (vh - sh) / 2;

        // 平移后左上角坐标 = initLeft + posX, initTop + posY
        // 必须满足：0 <= initLeft + posX <= vw - sw
        //          0 <= initTop + posY <= vh - sh
        const minX = -initLeft;
        const maxX = vw - sw - initLeft;
        const minY = -initTop;
        const maxY = vh - sh - initTop;

        return { minX, maxX, minY, maxY };
    }

    // 限制数值范围
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // 应用 transform：先平移后旋转
    function applyTransform() {
        spinner.style.transform =
            'translate(' + posX + 'px, ' + posY + 'px) rotate(' + angle + 'rad)';
    }

    // ========== 事件处理 ==========
    function onPointerDown(e) {
        e.preventDefault();
        const pos = getPointerXY(e);
        prevX = pos.x;
        prevY = pos.y;
        lastTimestamp = performance.now();

        // 判断按下位置是否在中心区域
        if (isInCenter(pos.x, pos.y)) {
            mode = 'translate';
            transVelocityX = 0;
            transVelocityY = 0;
        } else {
            mode = 'rotate';
            rotVelocity = 0;
        }

        isDragging = true;

        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
        document.addEventListener('touchcancel', onPointerUp);
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const now = performance.now();
        const dt = now - lastTimestamp;
        if (dt <= 0) return;

        const pos = getPointerXY(e);
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;

        if (mode === 'rotate') {
            // 旋转模式：水平移动驱动旋转
            const deltaAngle = dx * ROTATE_FACTOR;
            angle += deltaAngle;
            rotVelocity = deltaAngle / dt;
        } else if (mode === 'translate') {
            // 平移模式：跟随手指移动，并限制边界
            const bounds = getBoundaries();
            posX = clamp(posX + dx, bounds.minX, bounds.maxX);
            posY = clamp(posY + dy, bounds.minY, bounds.maxY);
            transVelocityX = dx / dt;
            transVelocityY = dy / dt;
        }

        applyTransform();

        prevX = pos.x;
        prevY = pos.y;
        lastTimestamp = now;
    }

    function onPointerUp(e) {
        isDragging = false;
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
        document.removeEventListener('touchcancel', onPointerUp);

        // 启动惯性动画
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(inertiaLoop);
    }

    // ========== 惯性动画 ==========
    function inertiaLoop(timestamp) {
        let shouldContinue = false;

        if (mode === 'rotate' && Math.abs(rotVelocity) >= MIN_SPEED) {
            rotVelocity *= INERTIA_DECAY_ROT;
            angle += rotVelocity * 16;  // 近似每帧16ms
            shouldContinue = true;
        }

        if (mode === 'translate') {
            const speed = Math.sqrt(transVelocityX * transVelocityX + transVelocityY * transVelocityY);
            if (speed >= MIN_SPEED) {
                transVelocityX *= INERTIA_DECAY_POS;
                transVelocityY *= INERTIA_DECAY_POS;
                // 尝试更新位置，并限制边界
                const bounds = getBoundaries();
                const newX = posX + transVelocityX * 24;  // 适当放大惯性距离
                const newY = posY + transVelocityY * 24;
                posX = clamp(newX, bounds.minX, bounds.maxX);
                posY = clamp(newY, bounds.minY, bounds.maxY);
                shouldContinue = true;
            } else {
                transVelocityX = 0;
                transVelocityY = 0;
            }
        }

        if (shouldContinue) {
            applyTransform();
            animId = requestAnimationFrame(inertiaLoop);
        } else {
            animId = null;
        }
    }

    // ========== 初始化 ==========
    function init() {
        applyTransform();
        spinner.addEventListener('mousedown', onPointerDown);
        spinner.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    init();
})();