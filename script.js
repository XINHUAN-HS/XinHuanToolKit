// ========== 时钟更新 ==========
function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toTimeString().split(' ')[0];
}
setInterval(updateClock, 1000);
updateClock();

// ========== 实体键盘 → 虚拟键盘高亮 ==========
const keyMap = {};
document.querySelectorAll('.key[data-key]').forEach(el => {
    const k = el.dataset.key;
    if (!keyMap[k]) keyMap[k] = [];
    keyMap[k].push(el);
});

document.addEventListener('keydown', e => {
    let target = e.key;
    if (['Shift','Control','Alt','Meta','CapsLock','Tab','Enter','Backspace','Space',
         'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape','Delete','Insert','Home','End','PageUp','PageDown'].includes(e.key))
        target = e.code;
    else if (e.key === ' ') target = 'Space';
    const els = keyMap[target] || keyMap[e.code] || [];
    els.forEach(el => el.classList.add('active'));
});

document.addEventListener('keyup', e => {
    let target = e.key;
    if (['Shift','Control','Alt','Meta','CapsLock','Tab','Enter','Backspace','Space',
         'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape','Delete','Insert','Home','End','PageUp','PageDown'].includes(e.key))
        target = e.code;
    else if (e.key === ' ') target = 'Space';
    const els = keyMap[target] || keyMap[e.code] || [];
    els.forEach(el => el.classList.remove('active'));
});

// ========== 终端输入 ==========
const inputField = document.getElementById('commandInput');
const outputDiv = document.getElementById('terminalOutput');

inputField.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const cmd = inputField.value.trim();
        if (cmd) {
            outputDiv.innerHTML += `\nroot@cyber:~$ ${cmd}\n[执行结果] 命令 '${cmd}' 未找到，请重试。\n`;
            outputDiv.scrollTop = outputDiv.scrollHeight;
            inputField.value = '';
        }
        e.preventDefault();
    }
});

// ========== 标签页管理 ==========
const tabContainer = document.getElementById('tabContainer');
const appFrame = document.getElementById('appFrame');
const terminalView = document.getElementById('terminalView');
const appView = document.getElementById('appView');

function openApp(name, category) {
    const exist = document.querySelector(`.tab[data-tab="${name}"]`);
    if (exist) { switchToTab(exist); return; }

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.tab = name;
    tab.innerHTML = `${name} <span class="close-btn" title="关闭">✕</span>`;

    const termTab = document.querySelector('.tab[data-tab="terminal"]');
    tabContainer.insertBefore(tab, termTab.nextSibling);

    switchToTab(tab);
    appFrame.src = `./apps/${category}/${name}.html`;

    tab.querySelector('.close-btn').addEventListener('click', e => {
        e.stopPropagation();
        closeTab(tab);
    });

    tab.addEventListener('click', e => {
        if (e.target.classList.contains('close-btn')) return;
        switchToTab(tab);
    });
}

function switchToTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (tab.dataset.tab === 'terminal') {
        terminalView.classList.add('active');
        appView.classList.remove('active');
    } else {
        terminalView.classList.remove('active');
        appView.classList.add('active');
    }
}

function closeTab(tab) {
    if (tab.classList.contains('active')) {
        const termTab = document.querySelector('.tab[data-tab="terminal"]');
        switchToTab(termTab);
    }
    tab.remove();
    if (!document.querySelector('.tab:not([data-tab="terminal"])')) {
        appFrame.src = '';
    }
}

// 初始化：选中终端标签
switchToTab(document.querySelector('.tab[data-tab="terminal"]'));

// ========== 加载外部 JSON 并生成文件系统 ==========
async function loadAppsConfig() {
    try {
        const response = await fetch('./apps.json');
        if (!response.ok) throw new Error('无法加载 apps.json');
        const config = await response.json();
        renderFileCategories(config.categories);
    } catch (err) {
        console.error('加载应用配置失败:', err);
        // 如果加载失败，显示一条提示
        document.getElementById('fileCategories').innerHTML = '<div style="color:#ff5555;padding:10px;">应用配置加载失败</div>';
    }
}

function renderFileCategories(categories) {
    const container = document.getElementById('fileCategories');
    container.innerHTML = ''; // 清空

    categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category';

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

// 启动加载
loadAppsConfig();

// ========== 数据模拟与闪烁 ==========
function simulateData() {
    const cpuEl = document.getElementById('cpuUsage');
    const cpuVal = Math.floor(Math.random() * 40) + 30;
    cpuEl.textContent = cpuVal + '%';

    const memEl = document.getElementById('memUsage');
    const memVal = Math.floor(Math.random() * 30) + 50;
    memEl.textContent = memVal + '%';
    document.getElementById('memBar').style.width = memVal + '%';

    const diskEl = document.getElementById('diskUsage');
    const diskVal = Math.floor(Math.random() * 30) + 20;
    diskEl.textContent = diskVal + '%';
    document.getElementById('diskBar').style.width = diskVal + '%';

    const up = (Math.random() * 3 + 0.5).toFixed(1);
    const down = (Math.random() * 5 + 1).toFixed(1);
    document.querySelector('.network-info .info-row:first-child span:last-child').textContent = up + ' MB/s';
    document.querySelector('.network-info .info-row:last-child span:last-child').textContent = down + ' MB/s';
}

setInterval(simulateData, 2000);
simulateData();