#!/usr/bin/env bash
# ikun社区 一键部署脚本(Linux / macOS 通用)
#
# 用法:
#   ./deploy.sh            # 默认端口 8080,前台运行(Ctrl+C 停止)
#   ./deploy.sh 3000       # 指定端口
#   nohup ./deploy.sh 8080 > ikun.log 2>&1 &   # 后台运行
#
# 行为:
#   1) 目录里有现成的 dist/ → 直接用它(服务器无需 Node)
#   2) 没有 dist/ → 自动 npm install + npm run build(需要 Node 18+)
#   3) 优先用 python3 起静态服务,没有则回退 npx serve
#      路由是 hash 模式,任意静态服务器都能跑,无需 rewrite 规则
set -euo pipefail

PORT="${1:-8080}"
cd "$(dirname "$0")"

if [ ! -f dist/index.html ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "[ikun] 未找到 dist/,且服务器没有 npm —— 二选一:"
    echo "       a) 在有 Node 的机器上 npm run build,把 dist/ 一起拷过来"
    echo "       b) 在服务器安装 Node.js 18+ 后重跑本脚本"
    exit 1
  fi
  echo "[ikun] 未发现 dist/,开始构建(首次会装依赖,稍等)..."
  npm ci 2>/dev/null || npm install
  npm run build
fi

echo "[ikun] 社区已就绪 → http://0.0.0.0:$PORT  (Ctrl+C 停止)"
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory dist
elif command -v npx >/dev/null 2>&1; then
  exec npx -y serve -l "$PORT" dist
else
  echo "[ikun] 需要 python3 或 Node.js(npx)其一用来起静态服务" >&2
  exit 1
fi
