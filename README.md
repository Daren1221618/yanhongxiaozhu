# 嫣红小主 · 花果茶鲜酿 — 官方网站

> 东方风雅，微醺悦己。以「东方微醺美学」为核心的国风花果茶鲜酿品牌官网。


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
