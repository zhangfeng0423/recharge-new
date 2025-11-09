# ADMIN用户登录指南

## 🚀 快速开始

### 1. 创建ADMIN用户

```bash
# 创建第一个ADMIN用户
pnpm admin:create admin@yourcompany.com YourSecurePassword123!

# 示例
pnpm admin:create admin@platform.com AdminPass2025!
```

### 2. 查看现有ADMIN用户

```bash
# 列出所有ADMIN用户
pnpm admin:list
```

### 3. 登录ADMIN账户

1. 启动应用：`pnpm dev`
2. 访问：`http://localhost:3000/auth`
3. 使用ADMIN邮箱和密码登录
4. 或者使用Google OAuth（如果配置了）

## 📋 详细操作指南

### 创建ADMIN用户

ADMIN用户创建脚本会执行以下操作：
1. ✅ 在Supabase Auth中创建用户账户
2. ✅ 在`profiles`表中创建ADMIN角色记录
3. ✅ 自动确认邮箱（无需邮箱验证）
4. ✅ 验证ADMIN权限设置成功

### 登录方式

#### 方式1：邮箱+密码登录
1. 访问 `http://localhost:3000/auth`
2. 输入ADMIN邮箱和密码
3. 点击登录

#### 方式2：Google OAuth登录（推荐）
1. 访问 `http://localhost:3000/auth`
2. 点击 "Continue with Google"
3. 使用Google账户登录
4. 系统会自动创建profile记录

### 🔧 权限说明

ADMIN用户具有以下权限：
- 👑 **超级管理员权限**：可以访问所有数据
- 🏪 **商家管理**：查看、创建、编辑、删除商家账户
- 🎮 **游戏管理**：管理所有商家的游戏和SKU
- 📊 **订单查看**：查看平台所有订单数据
- ⚙️ **系统配置**：修改系统设置（未来功能）

### 🛠️ 管理命令

```bash
# 创建新ADMIN用户
pnpm admin:create <email> <password>

# 查看所有ADMIN用户
pnpm admin:list

# 删除ADMIN用户（需要用户ID）
pnpm admin:delete <user-id>
```

## 🔒 安全注意事项

### 密码要求
- 最少8位字符
- 包含大小写字母
- 包含数字
- 建议包含特殊字符

### 生产环境安全
1. 🔐 **更改默认密码**：首次登录后立即更改
2. 🔑 **使用强密码**：避免简单密码
3. 📧 **邮箱验证**：生产环境建议启用邮箱验证
4. 🚫 **限制访问**：ADMIN账户仅供管理员使用
5. 📝 **审计日志**：记录ADMIN操作（未来功能）

### 环境变量配置
确保以下环境变量正确配置：
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 🚨 故障排除

### 问题1：创建ADMIN失败
```bash
❌ Missing required environment variables
```
**解决方案**：检查 `.env.local` 文件中的环境变量配置

### 问题2：登录失败
```bash
Authentication failed
```
**解决方案**：
1. 检查邮箱和密码是否正确
2. 确认ADMIN用户已创建：`pnpm admin:list`
3. 检查Supabase连接状态

### 问题3：权限不足
```bash
Access denied
```
**解决方案**：
1. 确认用户角色是ADMIN：检查profiles表
2. 重新登录刷新权限
3. 检查RLS策略是否正确

## 🎯 下一步

ADMIN用户创建成功后：
1. 🏠 访问管理员仪表板：`/dashboard/admin`
2. 👥 查看商家列表和管理功能
3. 🎮 浏览游戏和订单数据
4. ⚙️ 配置平台设置

## 📞 技术支持

如果遇到问题：
1. 检查控制台错误信息
2. 确认Supabase连接正常
3. 验证环境变量配置
4. 查看网络请求状态

---

**注意**：ADMIN账户具有平台最高权限，请妥善保管登录凭据！