# 环境变量同步到 Vercel 工具

这个工具可以帮助你将本地环境变量自动导出到 Vercel 项目。

## 🚀 快速开始

### 方法 1：使用 npm 脚本（推荐）

```bash
# 运行同步脚本
pnpm sync-env:vercel
```

### 方法 2：直接运行脚本

```bash
# 运行 shell 脚本
./scripts/sync-env.sh

# 或者运行 Node.js 脚本（需要先安装依赖）
node scripts/sync-env-to-vercel.js
```

## 📋 前置要求

1. **安装 Vercel CLI**：
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **链接项目**（如果还没有）：
   ```bash
   vercel link
   ```

## 🔧 工具功能

### 自动同步的环境变量：

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_POOLER_URL`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `DEFAULT_LOCALE`
- ✅ `SUPPORTED_LOCALES`
- ✅ `NODE_ENV`
- ✅ `JWT_SECRET`
- ✅ `CORS_ORIGINS`
- ✅ `RATE_LIMIT_PER_MINUTE`
- ✅ `MAX_FILE_SIZE`

### 需要手动设置的变量：

- ⚠️ `STRIPE_WEBHOOK_SECRET` - 需要从 Stripe Dashboard 获取

## 🎯 使用流程

1. **运行同步脚本**：
   ```bash
   pnpm sync-env:vercel
   ```

2. **选择环境**：
   - 1: Production (生产环境)
   - 2: Preview/Development (预览/开发环境)
   - 3: Both (两个环境都导出)

3. **等待脚本完成**：
   - 脚本会自动导出所有允许的环境变量
   - 创建参考文件 `.vercel.env.production` 或 `.vercel.env.preview`

4. **手动设置 Webhook Secret**：
   - 访问 Stripe Dashboard
   - 创建 webhook 端点：`https://your-domain.vercel.app/api/webhooks/stripe`
   - 复制 Signing Secret 并添加到 Vercel 环境变量

5. **更新生产环境特定的值**：
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`
   - `CORS_ORIGINS`: `https://your-domain.vercel.app`

## 📝 参考文件

脚本运行后会创建参考文件：

### `.vercel.env.production`
```bash
# 生产环境变量参考
NEXT_PUBLIC_SUPABASE_URL=https://curtvyynqzjdpjtfosrz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ... 其他变量

# ⚠️  重要手动设置：
# 1. STRIPE_WEBHOOK_SECRET - 从 Stripe Dashboard 获取
# 2. 更新 NEXT_PUBLIC_APP_URL 为生产域名
# 3. 更新 CORS_ORIGINS 为生产域名
```

## 🔍 故障排除

### 问题 1：Vercel CLI 未安装
```bash
npm i -g vercel
```

### 问题 2：未登录 Vercel
```bash
vercel login
```

### 问题 3：项目未链接
```bash
vercel link
```

### 问题 4：权限错误
```bash
chmod +x scripts/sync-env.sh
```

### 问题 5：环境变量已存在
脚本会自动删除现有变量并重新创建，不用担心重复。

## 🎉 完成后的下一步

1. ✅ 环境变量已同步到 Vercel
2. ⚠️ 手动设置 `STRIPE_WEBHOOK_SECRET`
3. 🔧 更新生产环境特定的 URL
4. 🚀 在 Vercel Dashboard 触发重新部署
5. 🧪 测试部署的应用

## 📞 帮助

如果遇到问题：

1. 查看 Vercel Dashboard: https://vercel.com/dashboard
2. 检查项目设置中的环境变量
3. 查看 Vercel 部署日志
4. 确保本地 `.env.local` 文件格式正确