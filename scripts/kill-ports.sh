#!/bin/bash

# pnpm kill 脚本 - 关闭所有开发和测试相关的端口
# 常用端口: Next.js (3000), Playwright (3001-3009), Stripe CLI (4242), Supabase (54321)

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 检查并关闭开发相关端口...${NC}"

# 定义要检查的端口
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 4242 54321 54322 54323 54324 54325)

# 计数器
total_killed=0

# 函数：关闭指定端口的进程
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$pids" ]; then
        echo -e "${YELLOW}发现端口 $port 上的进程:${NC}"
        for pid in $pids; do
            local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            echo -e "  ${RED}→ 关闭进程 $pid ($process_name)${NC}"
            kill -9 $pid 2>/dev/null || true
            ((total_killed++))
        done
    fi
}

# 关闭指定端口
for port in "${PORTS[@]}"; do
    kill_port $port
done

# 特殊处理：关闭所有 Node.js 相关进程（除了当前脚本）
echo -e "\n${BLUE}🔍 检查并关闭相关的 Node.js 进程...${NC}"
current_pid=$$
node_pids=$(pgrep -f "node|next|tsx" | grep -v $current_pid || true)

if [ -n "$node_pids" ]; then
    echo -e "${YELLOW}发现相关 Node.js 进程:${NC}"
    for pid in $node_pids; do
        # 检查进程是否在运行开发服务器
        if ps -p $pid -o args= 2>/dev/null | grep -q "next dev\|tsx.*dev\|node.*dev"; then
            echo -e "  ${RED}→ 关闭开发服务器进程 $pid${NC}"
            kill -9 $pid 2>/dev/null || true
            ((total_killed++))
        fi
    done
fi

# 清理可能的 Playwright 浏览器进程
echo -e "\n${BLUE}🔍 清理 Playwright 浏览器进程...${NC}"
playwright_pids=$(pgrep -f "playwright|chromium|firefox|webkit" | head -10 || true)

if [ -n "$playwright_pids" ]; then
    echo -e "${YELLOW}发现 Playwright 浏览器进程:${NC}"
    for pid in $playwright_pids; do
        echo -e "  ${RED}→ 关闭浏览器进程 $pid${NC}"
        kill -9 $pid 2>/dev/null || true
        ((total_killed++))
    done
fi

# 清理临时文件
echo -e "\n${BLUE}🧹 清理临时文件...${NC}"
if [ -d ".next" ]; then
    echo -e "${YELLOW}清理 .next 缓存目录...${NC}"
    rm -rf .next
fi

if [ -d "node_modules/.cache" ]; then
    echo -e "${YELLOW}清理 node_modules 缓存...${NC}"
    rm -rf node_modules/.cache
fi

# 最终报告
echo -e "\n${GREEN}✅ 端口清理完成！${NC}"
echo -e "${GREEN}总共关闭了 $total_killed 个进程${NC}"

if [ $total_killed -eq 0 ]; then
    echo -e "${BLUE}没有发现需要关闭的进程${NC}"
else
    echo -e "${BLUE}所有开发端口和相关进程已清理${NC}"
fi

echo -e "\n${BLUE}💡 提示：现在可以运行 'pnpm dev' 重新启动开发服务器${NC}"