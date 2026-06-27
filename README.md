# 嫣红小主 · 花果茶鲜酿 — 官方网站

> 东方风雅，微醺悦己。以「东方微醺美学」为核心的国风花果茶鲜酿品牌官网。

## 🚀 部署到 Railway（GitHub + Railway）

### Step 1: 推送到 GitHub

在 GitHub 创建新仓库（如 `yanhong-xiaozhu`），然后：

```bash
cd yanhong-xiaozhu
git remote add origin https://github.com/你的用户名/yanhong-xiaozhu.git
git branch -M main
git commit -m "嫣红小主官网 — 初版上线"
git push -u origin main
```

### Step 2: 在 Railway 部署

1. 打开 [Railway](https://railway.app/)，用 GitHub 登录
2. 点击 **New Project → Deploy from GitHub repo**
3. 选择刚才推送的 `yanhong-xiaozhu` 仓库
4. Railway 会自动检测 Node.js 项目并部署

### Step 3: 配置持久化存储（重要！）

CMS 修改的数据需要跨部署保留：

1. 进入项目 **Settings → Volumes**
2. 点击 **Add Volume**
3. 设置挂载路径为 `/app/data`
4. 大小 1GB 即可

### Step 4: 设置环境变量（可选）

在 **Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SESSION_SECRET` | 随机字符串 | 会话加密密钥 |

### Step 5: 访问

部署完成后 Railway 会分配一个 `xxx.up.railway.app` 域名：
- **官网首页**：`https://xxx.up.railway.app/`
- **管理后台**：`https://xxx.up.railway.app/admin/`
- **默认账号**：`admin` / `yanhong2026`

> ⚠️ 首次部署后请立即修改管理员密码！

---

## 🖥 本地开发

```bash
npm install
node server.js
# 访问 http://localhost:3000
# 管理后台 http://localhost:3000/admin/
```

### 构建静态版本

```bash
node build.js
# 生成 dist/index.html（自包含单文件，可直接部署到任意静态托管）
```

---

## 📁 项目结构

```
yanhong-xiaozhu/
├── server.js              # Express 后端（CMS API）
├── build.js               # 静态站点构建脚本
├── railway.toml           # Railway 部署配置
├── package.json
├── public/
│   ├── index.html         # 前端页面模板
│   ├── css/style.css      # 东方微醺美学 设计系统
│   ├── js/main.js         # 前端交互
│   └── admin/             # CMS 管理后台
│       ├── login.html
│       └── dashboard.html
└── data/                  # 内容数据（部署时由 volume 持久化）
    ├── content.json       # 11个章节内容
    └── users.json         # 管理员账号
```
