import os
import json

# 加载 apps.json
with open('apps.json', 'r', encoding='utf-8') as f:
    apps_data = json.load(f)

def generate_html(label, category_title, app_name):
    """生成 HTML 模板，自动引用同名 CSS/JS"""
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{label}</title>
    <link rel="stylesheet" href="{app_name}.css">
    <style>
        body {{
            background: #000;
            color: #00ff41;
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }}
        h1 {{
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
            margin-bottom: 30px;
        }}
        .content {{
            background: rgba(0, 20, 0, 0.8);
            border: 1px solid #00ff41;
            padding: 25px;
            border-radius: 5px;
            max-width: 800px;
            width: 90%;
        }}
    </style>
</head>
<body>
    <h1>{label}</h1>
    <div class="content">
        <p>类别：{category_title}</p>
        <p>功能开发中...</p>
    </div>
    <script src="{app_name}.js"></script>
</body>
</html>'''

def main():
    base_dir = 'apps'
    os.makedirs(base_dir, exist_ok=True)

    for category in apps_data['categories']:
        category_title = category['title']
        apps = category['apps']

        if not apps:
            continue

        # 使用分类的第一个应用的 category 作为类别目录名
        category_dir = os.path.join(base_dir, apps[0]['category'])
        os.makedirs(category_dir, exist_ok=True)
        print(f'📁 创建类别目录: {category_dir}')

        # 为每个应用创建独立目录
        for app in apps:
            app_name = app['name']
            app_label = app['label']
            
            # ✅ 创建应用目录：apps/类别/应用名/
            app_dir = os.path.join(category_dir, app_name)
            os.makedirs(app_dir, exist_ok=True)
            print(f'  📦 创建应用目录: {app_dir}')

            # HTML
            html_path = os.path.join(app_dir, f'{app_name}.html')
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(generate_html(app_label, category_title, app_name))
            print(f'    ✅ {app_name}.html')

            # CSS
            css_path = os.path.join(app_dir, f'{app_name}.css')
            with open(css_path, 'w', encoding='utf-8') as f:
                f.write(f'/* {app_label} 样式 */\n.content {{ line-height: 1.6; }}\n')
            print(f'    ✅ {app_name}.css')

            # JS
            js_path = os.path.join(app_dir, f'{app_name}.js')
            with open(js_path, 'w', encoding='utf-8') as f:
                f.write(f'// {app_label}\nconsole.log("{app_label} 已加载");\n')
            print(f'    ✅ {app_name}.js')

    print('\n🎉 所有应用文件生成完成！')
    print('\n📂 生成的目录结构：')
    print('apps/')
    for category in apps_data['categories']:
        cat_name = category['apps'][0]['category'] if category['apps'] else 'empty'
        print(f'├── {cat_name}/')
        for app in category['apps'][:2]:  # 只显示前两个作为示例
            print(f'│   ├── {app["name"]}/')
            print(f'│   │   ├── {app["name"]}.html')
            print(f'│   │   ├── {app["name"]}.css')
            print(f'│   │   └── {app["name"]}.js')
        if len(category['apps']) > 2:
            print(f'│   └── ... ({len(category["apps"]) - 2} 个应用)')

if __name__ == '__main__':
    main()
