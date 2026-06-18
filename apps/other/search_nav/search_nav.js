 // 搜索引擎配置
        const searchEngines = [
	{ id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
            { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
            { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' },
            { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
            { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=' },
            { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?q=' }
        ];

        // 读取上次选择的引擎，没有则默认 google
        let currentEngineId = localStorage.getItem('preferredEngine') || 'bing';

        const input = document.getElementById('queryInput');
        const engineLabel = document.getElementById('engineLabel');
        const selectorContainer = document.getElementById('engineSelector');
        const toggleBtn = document.getElementById('toggleEngineBtn');

        // 更新引擎标签和按钮状态
        function setActiveEngine(id) {
            currentEngineId = id;
            const engine = searchEngines.find(e => e.id === id);
            if (engine) {
                engineLabel.textContent = engine.name;
            }
            localStorage.setItem('preferredEngine', id);
            document.querySelectorAll('.engine-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.engine === id);
            });
            input.focus();
        }

        // 创建引擎按钮
        function buildButtons() {
            selectorContainer.innerHTML = '';
            searchEngines.forEach(engine => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'engine-btn';
                btn.textContent = engine.name;
                btn.dataset.engine = engine.id;
                if (engine.id === currentEngineId) {
                    btn.classList.add('active');
                }
                btn.addEventListener('click', () => {
                    setActiveEngine(engine.id);
                    // 选择引擎后隐藏引擎列表
                    selectorContainer.classList.remove('show');
                });
                selectorContainer.appendChild(btn);
            });
        }

        // 执行搜索
        function performSearch() {
            const query = input.value.trim();
            if (!query) return;
            const engine = searchEngines.find(e => e.id === currentEngineId);
            if (!engine) return;
            const url = engine.url + encodeURIComponent(query);
            input.value = ''
            window.open(url, '_blank');
        }

        // 监听回车键
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // 点击放大镜区域切换引擎列表
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            selectorContainer.classList.toggle('show');
        });

        // 点击页面其他区域时隐藏引擎列表
        document.addEventListener('click', function(e) {
            if (!selectorContainer.contains(e.target) && !toggleBtn.contains(e.target)) {
                selectorContainer.classList.remove('show');
            }
        });

        // 初始化
        buildButtons();
        setActiveEngine(currentEngineId);