window.onload = () => {
    const c = document.getElementById("c");
    const ctx = c.getContext("2d");
    let width = c.width = window.innerWidth;
    let height = c.height = window.innerHeight;

    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1);

    const chars = "01".split("");

    // 全屏
    const enterFullscreen = () => {
        const el = document.documentElement;
        el.requestFullscreen?.() ||
        el.webkitRequestFullscreen?.() ||
        el.mozRequestFullScreen?.();
    };

    // 绘制
    const draw = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#0F0";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > height || Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };

    setInterval(draw, 33);

    window.onresize = () => {
        width = c.width = window.innerWidth;
        height = c.height = window.innerHeight;
        drops.length = 0;
        const newCols = Math.floor(width / fontSize);
        for (let i = 0; i < newCols; i++) drops[i] = 1;
    };

    document.body.addEventListener("click", () => {
        enterFullscreen();
        document.body.requestPointerLock?.();
    });
};