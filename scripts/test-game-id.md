# 游戏详情页面测试指南

## 🎯 测试 URL

访问以下 URL 来测试游戏详情页面：

### Mock 游戏数据中的游戏 ID：
1. **Dragon Quest Online**: http://localhost:3001/en/games/game-1
2. **Cyber Strike 2077**: http://localhost:3001/en/games/game-2
3. **Empire Builder Pro**: http://localhost:3001/en/games/game-3
4. **Speed Rivals**: http://localhost:3001/en/games/game-4

### 中文版本：
1. **龙之传说在线**: http://localhost:3001/zh/games/game-1
2. **赛博突击2077**: http://localhost:3001/zh/games/game-2
3. **帝国建造者专业版**: http://localhost:3001/zh/games/game-3
4. **极速对手**: http://localhost:3001/zh/games/game-4

## 🔍 调试步骤

1. 打开浏览器开发者工具 (F12)
2. 访问上述任一 URL
3. 查看 Console 选项卡中的日志
4. 查看 Network 选项卡中的 API 请求

## 📋 预期行为

### Console 日志应该显示：
```
Fetching game with ID: game-1
Game result: {data: {success: true, message: "Mock game fetched successfully", data: {...}}}
```

### 如果显示 Loading：
1. 检查 Console 是否有错误
2. 检查 Network 请求是否失败
3. 确认游戏 ID 是否正确