# XinHuanToolKit

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web-lightgrey)

一款赛博朋克（Cyberpunk）风格的 Web 端综合工具箱，模拟终端操作体验，集成系统资源监控、网络状态展示、虚拟键盘与文件系统入口。

## 📸 界面预览
+-------------------------------------------------------+

|  [ XINHUAN_TOOLKIT ]      ● 系统运行中 ● 网络连接...  |

+-------------------+-----------------------------------+

|  ◆ 系统监控 ◆     |  [本地终端]                        |

|  00:00:00         |  root@xinhuan:~$ █                 |

|                   |                                    |

|  CPU  45% ▁▂▃▄▅▆▇ |  > _                               |

|  MEM  67% ████░░░ |                                    |

|  DISK 34% ██░░░░░ |                                    |

+-------------------+-----------------------------------+

|  ◆ 文件系统 ◆     |  [虚拟键盘区域]                    |

|  > 搜索应用...    |  ` 1 2 3 ... Esc ... Ctrl         |

+-------------------+-----------------------------------+
## ✨ 功能特性

### 🖥 左侧：系统监控面板
- **动态资源图**：CPU、内存、磁盘使用率的实时折线图动画。
- **网络拓扑**：显示外网/内网 IP、网关、DNS 及流量波动。
- **实时数据**：上行/下行速度、活跃连接数、开放端口。

### 💻 中央：终端交互区
- **多视图切换**：支持“本地终端”与“应用视图”（Iframe 嵌入）。
- **命令输入**：模拟 Shell 输入体验。
- **Tab 管理**：支持多标签页逻辑（待扩展）。

### 📁 右侧：文件系统
- **应用搜索**：实时过滤工具列表。
- **分类展示**：按类别组织工具入口。

### ⌨️ 底部：虚拟键盘
- **全布局支持**：包含 Ctrl, Alt, Shift, CapsLock 等功能键。
- **点击输入**：支持鼠标点击虚拟键盘向终端输入字符。

## 🚀 快速开始

### 环境要求
- 现代浏览器（Chrome, Firefox, Edge, Safari）

### 运行方式
- 无需安装依赖，直接在服务器上运行index.html即可
- 或者直接访问https://xinhuan-hs.github.io/XinHuanToolKit/

## 📂 文件结构
XinHuanToolKit/

├── apps            # 工具视图

├── index.html      # 主页面结构（核心）

├── style.css       # 全局样式与主题

├── script.js       # 交互逻辑与动态数据

├── apps.json       # 工具配置

├── create_apps.py          # 根据apps.json生成apps目录与相应app页面

└── icon.ico        # 网站图标

## ⚙️ 配置与扩展

### 修改系统数据
当前 `script.js` 中的 CPU、内存、网络数据均为**前端模拟**。如需对接真实数据，请在 `script.js` 中修改定时器逻辑，替换为 `fetch()` 调用后端 API。

示例：替换随机数为真实数据

async function updateMetrics() {

const res = await fetch('/api/system');

const data = await res.json();

document.getElementById('cpuUsage').innerText = data.cpu + '%';

}

### 添加新应用
在右侧文件系统面板添加应用入口，需在 `script.js` 中的文件分类数组中添加配置项。

## 🛠 技术栈

| 分类 | 技术 |
| :--- | :--- |
| **结构** | HTML5 |
| **样式** | CSS3 (Grid/Flexbox, Animations) |
| **脚本** | Vanilla JavaScript (ES6+) |
| **图形** | SVG (Polyline Charts) |

## 📝 注意事项

1. **安全性**：本项目仅为前端 UI 演示，**不具备**真实的系统控制权限。
2. **兼容性**：部分 CSS 特性（如 `backdrop-filter`）在旧版浏览器中可能不兼容。
3. **Iframe**：应用视图使用 Iframe 加载，请确保目标地址允许跨域访问（CORS）。
