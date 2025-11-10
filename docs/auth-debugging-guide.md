# AUTH_001 认证问题逐步调试指南

## 概述

本指南详细说明如何使用 Chrome DevTools MCP 和手动方法来诊断和解决 AUTH_001 "Server authentication failed: Auth session missing!" 错误。

## 前置条件

1. **确保开发服务器运行**：`pnpm dev` (localhost:3000)
2. **安装 Chrome DevTools MCP**：确保 MCP 服务器已启用
3. **了解基本操作**：熟悉 MCP 工具的基本使用方法

## 🚀 快速开始

### 自动化诊断（推荐）

1. **运行自动化诊断脚本**：
   ```bash
   node scripts/auth-diagnostic.mcp.js
   ```

2. **查看诊断报告**：
   ```bash
   cat auth-diagnostic-report.json
   ```

3. **根据建议进行修复**

### 手动诊断（用于深入分析）

如果需要更深入的分析，可以按照以下步骤进行手动调试：

## 📋 手动调试步骤

### 步骤 1: 初始化浏览器环境

```javascript
// 使用 MCP 创建新页面
await mcp__chrome_devtools__new_page({
  url: 'http://localhost:3000',
  timeout: 10000
});

// 选择页面（如果有多页）
await mcp__chrome_devtools__select_page({ pageIdx: 0 });

// 调整窗口大小
await mcp__chrome_devtools__resize_page({ width: 1200, height: 800 });
```

### 步骤 2: 检查应用加载状态

```javascript
// 获取页面快照
const snapshot = await mcp__chrome_devtools__take_snapshot({
  verbose: false
});

// 检查 React/Next.js 加载状态
const appStatus = await mcp__chrome_devtools__evaluate_script({
  function: `
    () => ({
      reactLoaded: !!window.React,
      nextLoaded: !!window.__NEXT_DATA__,
      supabaseLoaded: !!window.supabase,
      readyState: document.readyState
    })
  `
});

console.log('应用状态:', appStatus);
```

### 步骤 3: 监控网络请求

```javascript
// 导航到认证页面
await mcp__chrome_devtools__navigate_page({
  type: 'url',
  url: 'http://localhost:3000/auth',
  ignoreCache: true,
  timeout: 10000
});

// 等待页面加载
await mcp__chrome_devtools__wait_for({ text: 'body', timeout: 5000 });

// 获取网络请求
const requests = await mcp__chrome_devtools__list_network_requests({
  pageSize: 50,
  pageIdx: 0,
  resourceTypes: ['fetch', 'xhr', 'script'],
  includePreservedRequests: false
});

// 过滤认证相关请求
const authRequests = requests.requests?.filter(req =>
  req.url?.includes('supabase') || req.url?.includes('auth')
) || [];

console.log('认证相关请求:', authRequests);
```

### 步骤 4: 检查浏览器存储

```javascript
// 检查 localStorage
const localStorage = await mcp__chrome_devtools__evaluate_script({
  function: `
    () => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('supabase')) {
          storage[key] = localStorage.getItem(key);
        }
      }
      return storage;
    }
  `
});

// 检查 cookies
const cookies = await mcp__chrome_devtools__evaluate_script({
  function: `
    () => document.cookie.split(';')
      .filter(cookie => cookie.trim().includes('supabase') || cookie.trim().includes('auth'))
      .map(cookie => cookie.trim())
  `
});

console.log('localStorage:', localStorage);
console.log('cookies:', cookies);
```

### 步骤 5: 验证 Supabase 客户端

```javascript
// 检查 Supabase 客户端状态
const supabaseStatus = await mcp__chrome_devtools__evaluate_script({
  function: `
    async () => {
      try {
        const supabase = window.supabase;
        if (!supabase) return { error: 'Supabase client not found' };

        const { data: session } = await supabase.auth.getSession();
        const { data: user } = await supabase.auth.getUser();

        return {
          clientExists: true,
          session: session.session ? 'exists' : 'null',
          user: user.user ? 'exists' : 'null'
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  `
});

console.log('Supabase 状态:', supabaseStatus);
```

### 步骤 6: 分析控制台错误

```javascript
// 获取控制台消息
const messages = await mcp__chrome_devtools__list_console_messages({
  pageSize: 100,
  pageIdx: 0,
  types: ['error', 'warn', 'log'],
  includePreservedMessages: true
});

// 过滤认证相关消息
const authMessages = messages.messages?.filter(msg =>
  msg.text?.toLowerCase().includes('auth') ||
  msg.text?.toLowerCase().includes('supabase') ||
  msg.text?.includes('AUTH_001')
) || [];

console.log('认证相关消息:', authMessages);

// 获取错误详情
for (const msg of authMessages.filter(m => m.type === 'error')) {
  const detail = await mcp__chrome_devtools__get_console_message({ msgid: msg.msgid });
  console.log('错误详情:', detail);
}
```

## 🔧 常见问题诊断

### 问题 1: Supabase 客户端未初始化

**症状**：
- `window.supabase` 为 `undefined`
- 控制台显示 "supabase is not defined"

**诊断步骤**：
```javascript
await mcp__chrome_devtools__evaluate_script({
  function: `
    () => {
      console.log('window.supabase:', window.supabase);
      console.log('Supabase scripts:',
        Array.from(document.querySelectorAll('script'))
          .filter(s => s.src?.includes('supabase'))
          .map(s => s.src)
      );
      return { hasSupabase: !!window.supabase };
    }
  `
});
```

**修复建议**：
1. 检查 `src/lib/supabaseClient.ts` 配置
2. 验证环境变量是否正确加载
3. 确认客户端组件正确导入 Supabase 客户端

### 问题 2: 认证会话丢失

**症状**：
- `supabase.auth.getSession()` 返回 `{ session: null }`
- localStorage 中没有认证数据

**诊断步骤**：
```javascript
await mcp__chrome_devtools__evaluate_script({
  function: `
    () => {
      // 检查所有存储
      const data = {
        localStorage: {},
        sessionStorage: {},
        cookies: document.cookie
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data.localStorage[key] = localStorage.getItem(key);
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data.sessionStorage[key] = sessionStorage.getItem(key);
      }

      return data;
    }
  `
});
```

**修复建议**：
1. 检查 cookie 设置策略
2. 验证 `supabaseServer.ts` 中的配置
3. 确认登录流程正确设置会话

### 问题 3: RLS 策略阻止访问

**症状**：
- 认证成功但数据访问失败
- 服务器端 `getUser()` 返回 null

**诊断步骤**：
```javascript
// 在浏览器控制台中测试
await mcp__chrome_devtools__evaluate_script({
  function: `
    async () => {
      try {
        const { data, error } = await window.supabase
          .from('profiles')
          .select('*')
          .limit(1);

        return { data, error: error?.message };
      } catch (err) {
        return { error: err.message };
      }
    }
  `
});
```

**修复建议**：
1. 检查 Supabase RLS 策略配置
2. 验证用户权限设置
3. 确认数据库连接配置

## 🛠️ 代码修复检查清单

### 环境配置检查

```bash
# 1. 检查 .env.local 是否存在
ls -la .env.local

# 2. 检查环境变量
cat .env.local | grep SUPABASE

# 3. 验证数据库连接
pnpm run test-connection
```

### 认证文件检查

```bash
# 1. 检查关键文件存在性
ls -la src/lib/supabase*.ts
ls -la src/actions/auth.actions.ts

# 2. 检查 TypeScript 错误
pnpm run typecheck

# 3. 检查 ESLint 错误
pnpm run lint
```

## 🔍 高级调试技巧

### 1. 实时监控认证状态

```javascript
// 设置认证状态监听器
await mcp__chrome_devtools__evaluate_script({
  function: `
    if (window.supabase) {
      window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
      });
    }
  `
});
```

### 2. 模拟网络条件

```javascript
// 模拟慢速网络
await mcp__chrome_devtools__emulate({
  networkConditions: 'Slow 3G',
  cpuThrottlingRate: 4
});

// 测试慢速网络下的认证
// ... 执行认证流程

// 恢复正常网络
await mcp__chrome_devtools__emulate({
  networkConditions: 'No emulation',
  cpuThrottlingRate: 1
});
```

### 3. 性能分析

```javascript
// 开始性能追踪
await mcp__chrome_devtools__performance_start_trace({
  reload: true,
  autoStop: true
});

// 执行认证操作...

// 分析性能数据
const insights = await mcp__chrome_devtools__performance_analyze_insight({
  insightSetId: 'your-insight-id',
  insightName: 'DocumentLatency'
});
```

## 📊 自动化测试流程

创建可重复的测试脚本：

```javascript
async function testAuthFlow() {
  const tester = new AuthDiagnosticTool();

  // 运行完整诊断
  await tester.runFullDiagnostic();

  // 生成报告
  const report = tester.generateDiagnosticReport();

  // 返回测试结果
  return report;
}
```

## 🚨 故障排查清单

### 立即检查项

- [ ] 开发服务器是否运行在 localhost:3000
- [ ] .env.local 文件是否存在且配置正确
- [ ] Supabase 连接是否正常
- [ ] 浏览器控制台是否有错误信息

### 深入检查项

- [ ] RLS 策略是否正确配置
- [ ] 认证流程是否完整
- [ ] 客户端和服务端配置是否一致
- [ ] 网络请求是否成功

### 性能检查项

- [ ] 页面加载时间是否正常
- [ ] 认证 API 响应时间是否合理
- [ ] 数据库查询性能是否正常

## 📞 寻求帮助

如果以上步骤都无法解决问题：

1. **收集诊断信息**：
   ```bash
   node scripts/auth-diagnostic.mcp.js > auth-debug.log 2>&1
   ```

2. **检查日志文件**：
   ```bash
   tail -f .next/server.log
   tail -f supabase/logs/*.log
   ```

3. **提供上下文信息**：
   - 操作系统版本
   - Node.js 版本
   - 浏览器版本
   - 具体错误信息
   - 复现步骤

## 🔄 持续监控

设置定期健康检查：

```javascript
// 定期运行诊断
setInterval(async () => {
  const diagnostic = new AuthDiagnosticTool();
  await diagnostic.runQuickHealthCheck();
}, 60000); // 每分钟检查一次
```

---

本指南涵盖了 AUTH_001 认证问题的全面诊断和修复方法。按照步骤执行，应该能够识别并解决大多数认证相关问题。