// 原生JavaScript实现
document.addEventListener('DOMContentLoaded', function() {
    // 游戏状态变量
    let gameState = 'idle'; // idle, waiting, ready
    let startTime = 0;
    let colorChangeInterval = null;
    let redTimeout = null;
    let currentColor = '#001100';
    
    // 预定义颜色数组（不包括红色）
    const colors = [
        '#001100', // 深绿
        '#003300', // 暗绿
        '#005500', // 森林绿
        '#007700', // 中绿
        '#009900', // 亮绿
        '#006600', // 橄榄绿
        '#004400', // 墨绿
        '#008800', // 青柠绿
        '#00aa00', // 鲜绿
        '#00cc00', // 亮青绿
        '#000033', // 深蓝
        '#000066', // 暗蓝
        '#000099', // 中蓝
        '#0000cc', // 亮蓝
        '#330033', // 深紫
        '#660066', // 暗紫
        '#990099', // 中紫
        '#cc00cc', // 亮紫
        '#333300', // 深黄
        '#666600', // 暗黄
        '#999900', // 中黄
        '#cccc00', // 亮黄
        '#442200', // 深橙
        '#884400', // 暗橙
        '#cc6600', // 中橙
        '#ff8800', // 亮橙
    ];
    
    // DOM元素
    const reaction = document.getElementById('reaction');
    const reactionText = document.getElementById('reaction-text');
    const mainText = reactionText.querySelector('.r-main');
    const subText = reactionText.querySelector('p');
    const resultDisplay = document.getElementById('reaction-result-in-box');
    const colorIndicator = document.getElementById('color-indicator');
    
    // 初始化颜色指示器
    colorIndicator.style.backgroundColor = currentColor;
    
    // 点击事件处理
    reaction.addEventListener('click', handleReactionClick);
    
    // 键盘事件处理
    document.addEventListener('keydown', function(e) {
        // 空格键开始游戏
        if (e.code === 'Space') {
            e.preventDefault();
            handleReactionClick();
        }
    });
    
    // 处理反应点击
    function handleReactionClick() {
        if (gameState === 'idle') {
            // 开始游戏
            startGame();
        } else if (gameState === 'ready') {
            // 计算反应时间（从红色出现到点击）
            const reactionTime = Date.now() - startTime;
            
            // 更新UI
            reactionText.classList.remove('waiting', 'ready');
            mainText.textContent = '完成！';
            subText.textContent = '> 点击或按空格键重新开始';
            
            // 更新结果显示
            updateResultDisplay(reactionTime);
            
            // 停止颜色变化
            clearInterval(colorChangeInterval);
            clearTimeout(redTimeout);
            
            gameState = 'idle';
        }
    }
    
    // 开始游戏
    function startGame() {
        if (gameState !== 'idle') return;
        
        gameState = 'waiting';
        reactionText.classList.remove('ready');
        reactionText.classList.add('waiting');
        mainText.textContent = '准备中...';
        subText.textContent = '> 等待红色出现';
        
        // 清空上次的结果显示
        resultDisplay.textContent = '--';
        
        // 开始随机颜色变化
        startRandomColorChange();
        
        // 随机延迟后变成红色 (1-4秒)
        const delay = Math.random() * 3000 + 1000;
        
        redTimeout = setTimeout(function() {
            if (gameState === 'waiting') {
                gameState = 'ready';
                reactionText.classList.remove('waiting');
                reactionText.classList.add('ready');
                mainText.textContent = '点击！';
                subText.textContent = '> 立即点击！';
                
                // 设置为红色
                currentColor = '#ff0000';
                reactionText.style.backgroundColor = currentColor;
                colorIndicator.style.backgroundColor = currentColor;
                
                // 记录开始时间（红色出现的时刻）
                startTime = Date.now();
            }
        }, delay);
    }
    
    // 开始随机颜色变化
    function startRandomColorChange() {
        // 清除之前的颜色变化
        if (colorChangeInterval) {
            clearInterval(colorChangeInterval);
        }
        
        // 每300毫秒换一种颜色
        colorChangeInterval = setInterval(function() {
            if (gameState === 'waiting') {
                // 随机选择一个颜色（不包括红色）
                const randomIndex = Math.floor(Math.random() * colors.length);
                currentColor = colors[randomIndex];
                
                // 更新方块颜色和指示器
                reactionText.style.backgroundColor = currentColor;
                colorIndicator.style.backgroundColor = currentColor;
            }
        }, 300);
    }
    
    // 更新结果显示
    function updateResultDisplay(time) {
        resultDisplay.textContent = `${time} 毫秒`;
        
        // 根据反应时间改变颜色
        if (time < 200) {
            resultDisplay.style.color = '#00ff41'; // 绿色
            resultDisplay.style.textShadow = '0 0 20px rgba(0, 255, 65, 1)';
        } else if (time < 300) {
            resultDisplay.style.color = '#00ff41'; // 绿色
            resultDisplay.style.textShadow = '0 0 15px rgba(0, 255, 65, 0.8)';
        } else if (time < 400) {
            resultDisplay.style.color = '#ffff00'; // 黄色
            resultDisplay.style.textShadow = '0 0 15px rgba(255, 255, 0, 0.8)';
        } else if (time < 500) {
            resultDisplay.style.color = '#ff9900'; // 橙色
            resultDisplay.style.textShadow = '0 0 15px rgba(255, 153, 0, 0.8)';
        } else {
            resultDisplay.style.color = '#ff3300'; // 红色
            resultDisplay.style.textShadow = '0 0 15px rgba(255, 51, 0, 0.8)';
        }
    }
    
    // 控制台日志
    console.log('> 反应时间测试已初始化');
    console.log('> 按空格键或点击方块开始测试');
    console.log('> 方块会随机变色，看到红色后立即点击');
});