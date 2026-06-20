(function () {
  "use strict";

  const config = {
    ballCount: 40,
    minBalls: 1,
    maxBalls: 200
  };

  const balls = [];
  const stage = document.querySelector(".stage");
  const IMG = "./";

  /* ===== 初始化 ===== */
  function init() {
    preventScroll();
    createBalls();
    startPhysics();
    setupCounter();
  }

  /* ===== 禁止页面滚动 ===== */
  function preventScroll() {
    document.body.addEventListener(
      "touchmove",
      e => e.preventDefault(),
      { passive: false }
    );
  }

  /* ===== 创建小球 ===== */
  function createBalls() {
    stage.innerHTML = "";
    balls.length = 0;

    for (let i = 0; i < config.ballCount; i++) {
      balls.push(createBall());
    }

    updateCounterDisplay();
  }

  function createBall() {
    const el = document.createElement("div");
    el.className = "ball";

    const size = 30 + Math.random() * 30;
    el.style.width = el.style.height = size + "px";

    setEmoji(el);

    el.addEventListener("pointerdown", () => pokeBall(el));

    stage.appendChild(el);

    return {
      el,
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -6,
      size
    };
  }

  /* ===== 表情设置 ===== */
  function setEmoji(el) {
    try {
      const col = Math.floor(Math.random() * 6);
      const row = Math.floor(Math.random() * 6);

      el.style.borderRadius = "0";
      el.style.backgroundImage = `url(${IMG}emoji-new.png)`;
      el.style.backgroundSize = "600% 600%";
      el.style.backgroundPosition = `${(col / 5) * 100}% ${(row / 5) * 100}%`;
      el.style.backgroundColor = "transparent";
    } catch (e) {
      el.style.backgroundColor = "#00ff41";
      el.style.borderRadius = "50%";
    }
  }

  /* ===== 戳球 ===== */
  function pokeBall(el) {
    const b = balls.find(b => b.el === el);
    if (!b) return;

    b.vy = -18 - Math.random() * 10;
    b.vx += (Math.random() - 0.5) * 6;
  }

  /* ===== 物理引擎 ===== */
  function startPhysics() {
    function loop() {
      requestAnimationFrame(loop);

      for (const b of balls) {
        b.vy += 0.4;

        if (b.y > innerHeight - b.size) {
          b.y = innerHeight - b.size;
          b.vy *= -0.75;
        }

        if (b.x < 0 || b.x > innerWidth - b.size) {
          b.vx *= -1;
        }

        b.x += b.vx;
        b.y += b.vy;

        b.el.style.transform = `translate3d(${b.x}px,${b.y}px,0)`;
      }
    }
    loop();
  }

  /* ===== 球总数控制器 ===== */
  function setupCounter() {
    const countDisplay = document.getElementById("ballCount");
    const decreaseBtn = document.getElementById("decreaseBtn");
    const increaseBtn = document.getElementById("increaseBtn");

    decreaseBtn.addEventListener("click", () => {
      if (config.ballCount > config.minBalls) {
        config.ballCount--;
        createBalls();
      }
    });

    increaseBtn.addEventListener("click", () => {
      if (config.ballCount < config.maxBalls) {
        config.ballCount++;
        createBalls();
      }
    });

    // 键盘快捷键
    document.addEventListener("keydown", (e) => {
      if (e.key === "+" || e.key === "=") {
        if (config.ballCount < config.maxBalls) {
          config.ballCount++;
          createBalls();
        }
      } else if (e.key === "-" || e.key === "_") {
        if (config.ballCount > config.minBalls) {
          config.ballCount--;
          createBalls();
        }
      }
    });

    updateCounterDisplay();
  }

  function updateCounterDisplay() {
    const countDisplay = document.getElementById("ballCount");
    if (countDisplay) {
      countDisplay.textContent = config.ballCount;
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();