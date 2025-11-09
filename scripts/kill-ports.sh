#!/bin/bash

# 关闭所有运行中的端口的脚本
# 适用于 macOS 和 Linux

echo "🔍 正在查找运行中的进程..."

# 查找并关闭 Next.js 开发服务器 (通常是 3000 端口)
echo "关闭 Next.js 开发服务器..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "没有找到运行在 3000 端口的进程"

# 查找并关闭其他常见的开发端口
PORTS=(3001 3002 8000 8080 5000 4000 5432 3306)

for port in "${PORTS[@]}"; do
    echo "检查端口 $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "没有找到运行在 $port 端口的进程"
done

# 查找并关闭所有 Node.js 相关进程（可选，谨慎使用）
echo "查找其他 Node.js 进程..."
pkill -f "next dev" 2>/dev/null || echo "没有找到 next dev 进程"
pkill -f "node.*dev" 2>/dev/null || echo "没有找到其他 node dev 进程"

# 清理任何可能的僵尸进程
echo "清理僵尸进程..."
pkill -f "tsx" 2>/dev/null || echo "没有找到 tsx 进程"
pkill -f "vitest" 2>/dev/null || echo "没有找到 vitest 进程"

echo "✅ 所有端口已清理完成！"