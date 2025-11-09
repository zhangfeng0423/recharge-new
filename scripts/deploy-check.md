# 部署验证清单

## 🔍 基础功能检查

### 1. 主页访问
- [ ] 访问 https://recharge-steel.vercel.app
- [ ] 检查是否显示游戏平台页面（而不是 Next.js 默认页）
- [ ] 检查国际化切换（EN/ZH）是否正常

### 2. API 端点测试
```bash
# 测试数据库连接
curl https://recharge-steel.vercel.app/api/test-connection

# 测试认证端点
curl -X POST https://recharge-steel.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Stripe Webhook 测试
- [ ] 在 Stripe Dashboard 中测试 webhook
- [ ] 检查 webhook 端点是否响应 200 状态码

## 🔧 常见问题排查

### 问题 1: 显示 Next.js 默认页面
**解决方案**: 检查 `vercel.json` 配置，确保根路由正确

### 问题 2: 环境变量未生效
**解决方案**: 在 Vercel Dashboard 中重新设置环境变量并重新部署

### 问题 3: 数据库连接失败
**解决方案**: 检查 Supabase Pooler URL 是否正确配置

### 问题 4: Stripe Webhook 失败
**解决方案**:
1. 检查 webhook URL 是否正确
2. 验证 signing secret 是否匹配
3. 检查事件是否正确选择