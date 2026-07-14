#!/bin/bash
# ============================================================
# 嫣红小主 · 宝塔面板一键部署脚本
# 在宝塔「终端」或 SSH 中执行：
#   chmod +x deploy.sh && bash deploy.sh
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

echo "=============================================="
echo "  嫣红小主 · 果茶鲜酿 — 宝塔部署"
echo "=============================================="
echo ""

# ─── 1. 检查环境 ───────────────────────────────
log "检查 Node.js..."
if ! command -v node &> /dev/null; then
    err "未安装 Node.js！请先在宝塔软件商店安装「Node.js 版本管理器」"
    exit 1
fi
NODE_VER=$(node -v)
log "Node.js 版本: $NODE_VER"

log "检查 PM2..."
if ! command -v pm2 &> /dev/null; then
    warn "未安装 PM2，正在安装..."
    npm install -g pm2
fi
log "PM2 已就绪"

# ─── 2. 部署代码 ───────────────────────────────
PROJECT_DIR="/www/wwwroot/yanhong-xiaozhu"
PORT="${PORT:-3001}"

if [ -d "$PROJECT_DIR" ]; then
    warn "目录已存在: $PROJECT_DIR"
    read -p "是否更新已有代码？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_DIR"
        git pull
        log "代码已更新"
    fi
else
    log "克隆项目..."
    git clone https://github.com/Daren1221618/yanhongxiaozhu.git "$PROJECT_DIR"
    log "项目已克隆到 $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# ─── 3. 安装依赖 ───────────────────────────────
log "安装 npm 依赖..."
npm install --production
log "依赖安装完成"

# ─── 4. 初始化数据目录 ─────────────────────────
mkdir -p "$PROJECT_DIR/data"
chmod 755 "$PROJECT_DIR/data"
log "数据目录已创建: $PROJECT_DIR/data"

# ─── 5. 启动 PM2 ──────────────────────────────
# 先停掉旧实例（如果有）
pm2 delete yanhong-xiaozhu 2>/dev/null || true

log "启动服务 (端口: $PORT)..."
PORT=$PORT pm2 start server.js --name yanhong-xiaozhu --cwd "$PROJECT_DIR"
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || warn "pm2 startup 需手动执行"
log "PM2 已启动"

# ─── 6. 验证服务 ───────────────────────────────
sleep 2
if curl -s http://127.0.0.1:$PORT/ > /dev/null 2>&1; then
    log "服务运行正常 http://127.0.0.1:$PORT"
else
    warn "请稍等几秒后访问 http://127.0.0.1:$PORT 验证"
fi

# ─── 7. 输出 Nginx 配置 ────────────────────────
echo ""
echo "=============================================="
echo "  部署完成！接下来配置 Nginx："
echo "=============================================="
echo ""
echo "宝塔面板 → 网站 → 你的站点 → 设置 → 配置文件"
echo "在 server {} 块内添加以下内容："
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat << NGINX_CONF
    # === 嫣红小主 反代配置 ===
    location /yanhong/ {
        proxy_pass http://127.0.0.1:$PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    # ==========================
NGINX_CONF
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "添加后点「重载配置」，然后访问："
echo "  http://你的域名/yanhong/"
echo ""
echo "管理后台：http://你的域名/yanhong/admin/"
echo "默认账号：admin / yanhong2026"
echo ""
echo "后续更新代码："
echo "  cd $PROJECT_DIR && git pull && pm2 restart yanhong-xiaozhu"
echo ""
