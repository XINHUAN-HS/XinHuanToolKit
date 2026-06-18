// ========== 时钟更新 ==========
function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toTimeString().split(' ')[0];
}
setInterval(updateClock, 1000);
updateClock();

// ========== 实体键盘 → 虚拟键盘高亮（全局） ==========
const keyMap = {};
document.querySelectorAll('.key[data-key]').forEach(el => {
    const k = el.dataset.key;
    if (!keyMap[k]) keyMap[k] = [];
    keyMap[k].push(el);
});

document.addEventListener('keydown', e => handleKeyEvent(e, 'keydown'));
document.addEventListener('keyup', e => handleKeyEvent(e, 'keyup'));

function handleKeyEvent(e, type) {
    let matchedKeys = [];
    const code = e.code;

    if (code && keyMap[code]) {
        matchedKeys = keyMap[code];
    } else if (code && code.startsWith('Key')) {
        const letter = code.slice(3).toLowerCase();
        if (keyMap[letter]) matchedKeys = keyMap[letter];
    } else if (code && code.startsWith('Digit')) {
        const digit = code.slice(5);
        if (keyMap[digit]) matchedKeys = keyMap[digit];
    } else {
        let targetKey = e.key;
        if (['Shift','Control','Alt','Meta','CapsLock','Tab','Enter','Backspace','Space',
             'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape','Delete','Insert','Home','End','PageUp','PageDown'].includes(e.key)) {
            targetKey = e.code;
        } else if (e.key === ' ') {
            targetKey = 'Space';
        }
        if (keyMap[targetKey]) matchedKeys = keyMap[targetKey];
    }

    if (type === 'keydown') {
        matchedKeys.forEach(el => el.classList.add('active'));
    } else {
        matchedKeys.forEach(el => el.classList.remove('active'));
    }
}

window.addEventListener('message', event => {
    const data = event.data;
    if (!data || !data.type) return;
    const fakeEvent = { key: data.key, code: data.code };
    handleKeyEvent(fakeEvent, data.type);
});

// ========== 终端输入与命令系统 ==========
const inputField = document.getElementById('commandInput');
const outputDiv = document.getElementById('terminalOutput');

let appConfigCache = null;

inputField.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const cmd = inputField.value.trim();
        if (cmd) {
            processCommand(cmd);
            inputField.value = '';
        }
        e.preventDefault();
    }
});

function appendOutput(text) {
    outputDiv.innerHTML += '\n' + text;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function processCommand(input) {
    const parts = input.split(/\s+/);
    const command = parts[0].toLowerCase();

    // 先显示命令提示符和输入的命令（带 █ 符号）
    appendOutput(`root@xinhuan:~$ ${input} █`);

    switch (command) {
        case 'help':
            showHelp();
            break;
        case 'list':
            listApps();
            break;
        case 'clear':
            outputDiv.innerHTML = '';
            break;
        case 'open':
            if (parts.length < 3) {
                appendOutput('用法: open [类别名称] [应用名称]');
            } else {
                const category = parts[1].toLowerCase();
                const appName = parts[2].toLowerCase();
                openAppByName(category, appName);
            }
            break;
        case 'close':
            if (parts.length < 3) {
                appendOutput('用法: close [类别名称] [应用名称]');
            } else {
                const category = parts[1].toLowerCase();
                const appName = parts[2].toLowerCase();
                closeAppByName(category, appName);
            }
            break;
        default:
            appendOutput(`未知命令: ${command}\n输入 help 查看可用命令`);
    }
}

function showHelp() {
    appendOutput(
        '可用命令:\n' +
        '  help                          - 显示此帮助\n' +
        '  list                          - 列出所有类别和应用\n' +
        '  clear                         - 清屏\n' +
        '  open [类别] [应用名]          - 打开指定应用\n' +
        '  close [类别] [应用名]         - 关闭指定应用\n' +
        '例如: open JSON JSON格式化\n' +
        '     close JSON JSON格式化'
    );
}

function listApps() {
    if (!appConfigCache) {
        appendOutput('应用配置尚未加载，请稍后再试');
        return;
    }
    let result = '';
    appConfigCache.categories.forEach(cat => {
        result += `\n【${cat.title}】\n`;
        cat.apps.forEach(app => {
            result += `  ${app.label} (${app.name})\n`;
        });
    });
    appendOutput(result.trim());
}

function openAppByName(category, appName) {
    if (!appConfigCache) {
        appendOutput('应用配置尚未加载');
        return;
    }
    const cat = appConfigCache.categories.find(c =>
        c.title.toLowerCase() === category ||
        c.title.includes(category)
    );
    if (!cat) {
        appendOutput(`未找到类别: ${category}`);
        return;
    }
    const app = cat.apps.find(a =>
        a.name.toLowerCase() === appName ||
        a.label.toLowerCase() === appName
    );
    if (!app) {
        appendOutput(`在类别 ${cat.title} 中未找到应用: ${appName}`);
        return;
    }
    openApp(app.name, app.category);
    appendOutput(`正在打开: ${cat.title} > ${app.label}`);
}

function closeAppByName(category, appName) {
    if (!appConfigCache) {
        appendOutput('应用配置尚未加载');
        return;
    }
    const cat = appConfigCache.categories.find(c =>
        c.title.toLowerCase() === category ||
        c.title.includes(category)
    );
    if (!cat) {
        appendOutput(`未找到类别: ${category}`);
        return;
    }
    const app = cat.apps.find(a =>
        a.name.toLowerCase() === appName ||
        a.label.toLowerCase() === appName
    );
    if (!app) {
        appendOutput(`在类别 ${cat.title} 中未找到应用: ${appName}`);
        return;
    }
    
    // 查找对应的标签页并关闭
    const tab = document.querySelector(`.tab[data-tab="${app.name}"]`);
    if (tab) {
        closeTab(tab);
        appendOutput(`已关闭应用: ${cat.title} > ${app.label}`);
    } else {
        appendOutput(`未找到应用标签页: ${app.name}`);
    }
}

// ========== 标签页管理 ==========
const tabContainer = document.getElementById('tabContainer');
const appFrame = document.getElementById('appFrame');
const terminalView = document.getElementById('terminalView');
const appView = document.getElementById('appView');

// 存储每个应用的 iframe 状态
const appIframes = {};

function openApp(name, category) {
    const exist = document.querySelector(`.tab[data-tab="${name}"]`);
    if (exist) { switchToTab(exist); return; }

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.tab = name;
    tab.innerHTML = `${name} <span class="close-btn" title="关闭">✕</span>`;

    const termTab = document.querySelector('.tab[data-tab="terminal"]');
    tabContainer.insertBefore(tab, termTab.nextSibling);

    // 创建独立的 iframe 容器（隐藏）
    createAppIframe(name, category);

    switchToTab(tab);

    tab.querySelector('.close-btn').addEventListener('click', e => {
        e.stopPropagation();
        closeTab(tab);
    });

    tab.addEventListener('click', e => {
        if (e.target.classList.contains('close-btn')) return;
        switchToTab(tab);
    });
}

function createAppIframe(name, category) {
    // 检查是否已存在该应用的 iframe
    if (appIframes[name]) return;
    
    // 创建 iframe 元素
    const iframe = document.createElement('iframe');
    iframe.id = `appFrame_${name}`;
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#000;display:none;';
    iframe.dataset.appName = name;
    
    // 设置 src
    const url = `./apps/${category}/${name}/${name}.html`;
    iframe.src = url;
    
    // 添加到 appView 中
    appView.appendChild(iframe);
    
    // 存储引用
    appIframes[name] = iframe;
    
    // 注入脚本
    iframe.onload = function() {
        injectIntoIframe(iframe);
    };
}

function injectIntoIframe(iframe) {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc.getElementById('__injected_keyboard_script')) return;

        const script = iframeDoc.createElement('script');
        script.id = '__injected_keyboard_script';
        script.textContent = `
            document.addEventListener('keydown', function(e) {
                window.parent.postMessage({ type: 'keydown', key: e.key, code: e.code }, '*');
            });
            document.addEventListener('keyup', function(e) {
                window.parent.postMessage({ type: 'keyup', key: e.key, code: e.code }, '*');
            });
        `;
        iframeDoc.head.appendChild(script);

        const style = iframeDoc.createElement('style');
        style.id = '__injected_global_style';
        style.textContent = `
            body {
                background-color: #000 !important;
                color: #00ff41 !important;
                font-family: 'Courier New', monospace !important;
                margin: 0;
                padding: 10px;
            }
            a { color: #00ffff; }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: rgba(0,20,0,0.5); }
            ::-webkit-scrollbar-thumb { background: #00ff41; border-radius: 2px; }
        `;
        iframeDoc.head.appendChild(style);
    } catch (error) {
        console.warn('无法注入到 iframe，可能跨域:', error);
    }
}

function switchToTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (tab.dataset.tab === 'terminal') {
        terminalView.classList.add('active');
        appView.classList.remove('active');
        
        // 隐藏所有应用 iframe
        Object.values(appIframes).forEach(iframe => {
            iframe.style.display = 'none';
        });
    } else {
        terminalView.classList.remove('active');
        appView.classList.add('active');
        
        // 显示对应的应用 iframe
        const appName = tab.dataset.tab;
        Object.keys(appIframes).forEach(key => {
            if (key === appName) {
                appIframes[key].style.display = 'block';
            } else {
                appIframes[key].style.display = 'none';
            }
        });
    }
}

function closeTab(tab) {
    if (tab.classList.contains('active')) {
        const termTab = document.querySelector('.tab[data-tab="terminal"]');
        switchToTab(termTab);
    }
    
    // 移除对应的 iframe
    const appName = tab.dataset.tab;
    if (appIframes[appName]) {
        appIframes[appName].remove();
        delete appIframes[appName];
    }
    
    tab.remove();
}

// 初始化时激活终端标签并绑定点击事件
function initTerminalTab() {
    const termTab = document.querySelector('.tab[data-tab="terminal"]');
    if (termTab) {
        termTab.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-btn')) return;
            switchToTab(this);
        });
    }
}

// 初始化
initTerminalTab();
switchToTab(document.querySelector('.tab[data-tab="terminal"]'));

// ========== 从外部 apps.json 加载应用配置 ==========
async function loadAppsConfig() {
    try {
        const response = await fetch('./apps.json');
        if (!response.ok) throw new Error('无法加载 apps.json (HTTP ' + response.status + ')');
        const config = await response.json();
        appConfigCache = config;
        renderFileCategories(config.categories);
        setupSearchFilter(config.categories);
    } catch (err) {
        console.error('加载应用配置失败:', err);
        document.getElementById('fileCategories').innerHTML =
            `<div style="color:#ff5555;padding:10px;">⚠ 应用配置加载失败: ${err.message}<br>请确保通过 HTTP 服务器运行此页面。</div>`;
    }
}

let allCategories = [];

function renderFileCategories(categories) {
    allCategories = categories;
    const container = document.getElementById('fileCategories');
    container.innerHTML = '';

    categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category';
        catDiv.dataset.categoryTitle = cat.title;

        const title = document.createElement('div');
        title.className = 'cat-title';
        title.textContent = cat.title;
        catDiv.appendChild(title);

        const iconsDiv = document.createElement('div');
        iconsDiv.className = 'file-icons';

        cat.apps.forEach(app => {
            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.dataset.app = app.name;
            icon.dataset.category = app.category;
            icon.dataset.label = app.label;

            icon.innerHTML = `<i>${app.icon}</i><span>${app.label}</span>`;

            icon.addEventListener('click', () => {
                openApp(app.name, app.category);
            });

            iconsDiv.appendChild(icon);
        });

        catDiv.appendChild(iconsDiv);
        container.appendChild(catDiv);
    });
}

// ========== 搜索过滤功能 ==========
function setupSearchFilter(categories) {
    const searchInput = document.getElementById('appSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        filterCategories(query);
    });
}

function filterCategories(query) {
    const container = document.getElementById('fileCategories');
    renderFileCategories(allCategories);

    if (!query) return;

    const categories = container.querySelectorAll('.category');
    categories.forEach(catDiv => {
        const title = catDiv.querySelector('.cat-title').textContent.toLowerCase();
        const icons = catDiv.querySelectorAll('.file-icon');
        let categoryMatch = title.includes(query);
        let anyAppMatch = false;

        icons.forEach(icon => {
            const label = icon.dataset.label.toLowerCase();
            const name = icon.dataset.app.toLowerCase();
            const matches = label.includes(query) || name.includes(query);
            if (matches) {
                anyAppMatch = true;
                icon.style.display = '';
            } else {
                icon.style.display = 'none';
            }
        });

        // 如果类别标题匹配，显示整个类别（所有图标恢复显示）
        if (categoryMatch) {
            catDiv.style.display = '';
            icons.forEach(icon => icon.style.display = '');
        } else if (anyAppMatch) {
            catDiv.style.display = '';
        } else {
            catDiv.style.display = 'none';
        }
    });
}

loadAppsConfig();

// ========== 折线图随机波动 ==========
function generateRandomPoints(elementId, numPoints, width, height, yMin, yMax) {
    const polyline = document.getElementById(elementId);
    if (!polyline) return;
    const stepX = width / (numPoints - 1);
    let points = '';
    for (let i = 0; i < numPoints; i++) {
        const x = Math.round(i * stepX);
        const y = Math.floor(Math.random() * (yMax - yMin + 1)) + yMin;
        points += `${x},${y} `;
    }
    polyline.setAttribute('points', points.trim());

    polyline.style.animation = 'none';
    void polyline.offsetWidth;
    polyline.style.animation = 'dashFlow 4s linear infinite';
}

function randomizeCharts() {
    generateRandomPoints('cpuChartLine', 15, 280, 70, 8, 40);
    generateRandomPoints('memChartLine', 15, 280, 70, 10, 45);
    generateRandomPoints('diskChartLine', 15, 280, 70, 12, 55);
    generateRandomPoints('trafficChartLine', 15, 298, 78, 8, 62);
}

setInterval(randomizeCharts, 2420);
randomizeCharts();

// ========== 数据模拟与闪烁 ==========
function simulateData() {
    const cpuEl = document.getElementById('cpuUsage');
    const cpuVal = Math.floor(Math.random() * 39) + 32;
    cpuEl.textContent = cpuVal + '%';

    const memEl = document.getElementById('memUsage');
    const memVal = Math.floor(Math.random() * 29) + 52;
    memEl.textContent = memVal + '%';
    document.getElementById('memBar').style.width = memVal + '%';

    const diskEl = document.getElementById('diskUsage');
    const diskVal = Math.floor(Math.random() * 29) + 22;
    diskEl.textContent = diskVal + '%';
    document.getElementById('diskBar').style.width = diskVal + '%';

    const upEl = document.getElementById('upSpeed');
    const downEl = document.getElementById('downSpeed');
    const upVal = (Math.random() * 3.4 + 0.4).toFixed(1);
    const downVal = (Math.random() * 5.4 + 0.6).toFixed(1);

    [upEl, downEl].forEach(el => {
        el.style.color = '#ff3333';
        setTimeout(() => { el.style.color = '#00ff41'; }, 345);
    });
    upEl.textContent = upVal + ' MB/s';
    downEl.textContent = downVal + ' MB/s';

    const connEl = document.getElementById('activeConnections');
    const connVal = Math.floor(Math.random() * 89) + 11;
    connEl.style.color = '#ff3333';
    setTimeout(() => { connEl.style.color = '#00ff41'; }, 318);
    connEl.textContent = connVal;

    const portEl = document.getElementById('openPorts');
    const portsPool = [21, 22, 23, 25, 53, 69, 80, 110, 123, 137, 139, 143, 389, 443, 445, 993, 995, 1433, 1521, 1701, 1883, 2082, 2096, 2222, 2345, 2598, 3074, 3211, 3283, 3290, 3310, 3344, 3355, 3366, 3377, 3390, 3443, 3460, 3478, 3480, 3490, 3516, 3527, 3535, 3550, 3560, 3570, 3580, 3590, 3610, 3620, 3630, 3640, 3650, 3670, 3680, 3690, 3710, 3730, 3740, 3760, 3770, 3790, 3800, 3820, 3840, 3860, 3870, 3900, 3910, 3930, 3950, 3970, 3990, 4010, 4020, 4030, 4050, 4060, 4080, 4100, 4120, 4140, 4160, 4180, 4200, 4220, 4240, 4260, 4280, 4300, 4320, 4340, 4360, 4380, 4400, 4420, 4440, 4460, 4480, 4510, 4520, 4540, 4560, 4580, 4600, 4620, 4640, 4680, 4700, 4720, 4740, 4760, 4800, 4820, 4860, 4900, 4920, 4950, 4980, 5020, 5040, 5080, 5120, 5140, 5180, 5240, 5280, 5320, 5360, 5420, 5460, 5480, 5540, 5580, 5620, 5680, 5720, 5760, 5780, 5820, 5860, 5920, 6020, 6060, 6100, 6160, 6220, 6260, 6320, 6380, 6420, 6480, 6520, 6590, 6640, 6740, 6820, 6860, 6920, 7020, 7060, 7140, 7220, 7260, 7280, 7290, 7320, 7360, 7420, 7480, 7550, 7660, 7690, 7730, 7790, 7850, 7890, 7950, 8020, 8060, 8120, 8190, 8260, 8330, 8390, 8460, 8520, 8590, 8660, 8730, 8800, 8900, 9600, 9700, 9800, 9900, 10000];
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = portsPool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).sort((a,b) => a-b);
    portEl.style.color = '#ff3333';
    setTimeout(() => { portEl.style.color = '#00ff41'; }, 306);
    portEl.textContent = selected.join(', ');
}

setInterval(simulateData, 1940);
simulateData();