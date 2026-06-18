document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const results = document.getElementById('results');
    const subtitle = document.querySelector('.subtitle');
    
    // 状态映射
    const typeMap = {
        'text/plain': 'PLAIN',
        'text/html': 'HTML',
        'image/png': 'PNG',
        'image/jpeg': 'JPEG',
        'image/gif': 'GIF',
        'application/json': 'JSON'
    };

    // 核心粘贴监听
    document.addEventListener('paste', handlePaste);
    
    // 点击聚焦
    dropZone.addEventListener('click', () => dropZone.focus());

    function handlePaste(e) {
        e.preventDefault();
        const items = Array.from((e.clipboardData || window.clipboardData).items || []);
        
        if (items.length === 0) {
            showMessage('[系统] 剪贴板为空或未找到支持的数据');
            return;
        }

        results.innerHTML = ''; // 清空旧结果
        subtitle.textContent = `[系统] 正在处理 ${items.length} 个项目...`;

        let processedCount = 0;
        items.forEach(item => processItem(item));

        function processItem(item) {
            const type = item.type;
            const blob = item.getAsFile();
            
            if (!blob) {
                processedCount++;
                checkComplete();
                return;
            }

            const extension = getExtension(type, blob.name);
            const displayType = typeMap[type] || (blob.type.startsWith('image/') ? 'IMAGE' : 'FILE');
            
            // 创建卡片 (使用 Flex 布局)
            const card = document.createElement('div');
            card.className = 'card';
            
            const header = document.createElement('div');
            header.className = 'card-header';
            header.innerHTML = `
                <h3 class="card-title">> 项目 ${processedCount + 1}: [${displayType}]</h3>
                <div class="meta-info"></div>
            `;
            
            const body = document.createElement('div');
            body.className = 'card-body';

            card.appendChild(header);
            card.appendChild(body);
            results.appendChild(card);

            // 根据不同类型处理
            if (blob.type.startsWith('image/')) {
                handleImage(blob, body, header);
            } else if (type === 'text/html') {
                handleHtml(blob, body, header);
            } else if (isExcelFile(blob)) {
                handleExcel(blob, body, header);
            } else if (isTextFile(blob)) {
                handleText(blob, body, header);
            } else {
                handleGenericFile(blob, body, header);
            }

            processedCount++;
            checkComplete();
        }

        function checkComplete() {
            if (processedCount >= items.length) {
                subtitle.textContent = `[系统] 已处理 ${processedCount} 个项目`;
            }
        }
    }

    // --- 各类型处理函数 ---

    function handleImage(blob, body, header) {
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = url;
        img.alt = '预览图';
        
        const meta = header.querySelector('.meta-info');
        meta.innerHTML = `<span>[SIZE] ${formatSize(blob.size)}</span><span>[DATE] ${formatDate(blob.lastModified)}</span>`;
        
        body.appendChild(img);
        addDownloadButton(blob, body);
    }

    function handleText(blob, body, header) {
        const reader = new FileReader();
        reader.onload = e => {
            const meta = header.querySelector('.meta-info');
            meta.innerHTML = `<span>[SIZE] ${formatSize(blob.size)}</span><span>[DATE] ${formatDate(blob.lastModified)}</span>`;
            
            const pre = document.createElement('div');
            pre.className = 'text-preview';
            pre.textContent = e.target.result;
            body.appendChild(pre);
        };
        reader.readAsText(blob);
    }

    function handleHtml(blob, body, header) {
        const reader = new FileReader();
        reader.onload = e => {
            const meta = header.querySelector('.meta-info');
            meta.innerHTML = `<span>[SIZE] ${formatSize(blob.size)}</span>`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'html-preview';
            // 使用 innerHTML 渲染 HTML 结构
            wrapper.innerHTML = e.target.result; 
            body.appendChild(wrapper);
        };
        reader.readAsText(blob);
    }

    function handleExcel(blob, body, header) {
        const meta = header.querySelector('.meta-info');
        meta.innerHTML = `<span>[SIZE] ${formatSize(blob.size)}</span><span>[TYPE] Excel/CSV</span>`;
        
        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `
            <strong>提示:</strong> 浏览器安全策略限制，无法直接读取 Excel 单元格内容。<br>
            <strong>文件名:</strong> ${blob.name}
        `;
        body.appendChild(info);
        
        addDownloadButton(blob, body, '下载 Excel 文件');
    }

    function handleGenericFile(blob, body, header) {
        const meta = header.querySelector('.meta-info');
        meta.innerHTML = `<span>[SIZE] ${formatSize(blob.size)}</span><span>[TYPE] ${blob.type || 'unknown'}</span>`;
        
        const info = document.createElement('div');
        info.className = 'file-info';
        info.innerHTML = `<strong>文件名:</strong> ${blob.name || '未命名文件'}`;
        body.appendChild(info);
        
        addDownloadButton(blob, body);
    }

    // --- 辅助函数 ---

    function addDownloadButton(blob, container, label = '下载文件') {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = blob.name || `download-${Date.now()}`;
        link.className = 'btn';
        link.textContent = label;
        container.appendChild(link);
        link.onclick = () => setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }

    function isExcelFile(file) {
        const exts = ['.xls', '.xlsx', '.csv'];
        return exts.some(ext => file.name.toLowerCase().endsWith(ext)) || 
               file.type === 'application/vnd.ms-excel' || 
               file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    function isTextFile(file) {
        const textTypes = ['text/', 'application/json', 'application/xml'];
        const textExts = ['.txt', '.log', '.md', '.json', '.xml', '.csv', '.html', '.css', '.js'];
        return textTypes.some(t => file.type.startsWith(t)) || 
               textExts.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    function getExtension(type, name) {
        if (name) return name.substring(name.lastIndexOf('.'));
        if (type === 'text/plain') return '.txt';
        return '';
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    function showMessage(msg) {
        results.innerHTML = `<div class="empty-state">${msg}</div>`;
        subtitle.textContent = '[系统] 操作完成';
    }
});