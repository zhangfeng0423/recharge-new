# Mock Data Migration Plan

## 🎯 迁移目标
将扩展后的模拟数据（120个SKU + 20个订单）安全迁移到Supabase数据库。

## 📋 迁移选项

### 选项1: 安全迁移（推荐）
```bash
# 备份现有数据，然后迁移
node scripts/migrate-mock-data.js --backup
```

### 选项2: 完全重建
```bash
# 清空现有数据，然后导入新数据
node scripts/migrate-mock-data.js --clean
```

### 选项3: 预演模式（不执行）
```bash
# 查看将要执行的步骤，不实际执行
node scripts/migrate-mock-data.js --dry-run
```

## 🛡️ 安全措施

1. **数据备份**: 迁移前自动备份所有现有数据
2. **冲突检查**: 检测现有数据并提供选择
3. **回滚支持**: 保存备份文件以便恢复
4. **分步验证**: 每个步骤都有验证检查

## 📊 数据统计

### 现有数据（预估）
- Profiles: 5个
- Games: 6个
- SKUs: 24个
- Orders: 5个

### 新数据
- Profiles: 5个
- Games: 6个
- SKUs: 120个 **(+96个)**
- Orders: 20个 **(+15个)**

## ⚠️ 注意事项

1. **生产环境**: 在生产环境中运行前，务必先在测试环境验证
2. **数据冲突**: 如果有重要现有数据，建议使用备份选项
3. **ID冲突**: 新数据使用了新的ID格式，避免与现有数据冲突
4. **RLS策略**: 迁移后RLS策略会自动应用到新数据

## 🔧 手动迁移步骤（如果脚本遇到问题）

如果自动脚本遇到问题，可以通过Supabase Dashboard手动执行：

### 步骤1: 备份（可选）
1. 进入Supabase Dashboard
2. 选择你的项目
3. 进入SQL Editor
4. 执行备份查询：
```sql
-- 备份现有数据
CREATE TABLE profiles_backup AS SELECT * FROM profiles;
CREATE TABLE games_backup AS SELECT * FROM games;
CREATE TABLE skus_backup AS SELECT * FROM skus;
CREATE TABLE orders_backup AS SELECT * FROM orders;
```

### 步骤2: 清理数据（可选）
```sql
-- 清空表数据
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE skus CASCADE;
TRUNCATE TABLE games CASCADE;
TRUNCATE TABLE profiles CASCADE;
```

### 步骤3: 执行新数据
复制 `data/mock-data.sql` 的内容到SQL Editor并执行。

### 步骤4: 验证结果
```sql
-- 验证数据计数
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

## 🎉 预期结果

迁移成功后，你将看到：
- ✅ 每个游戏20个商品
- ✅ 总计120个SKU
- ✅ 丰富的价格梯度
- ✅ 完整的订单历史
- ✅ 统一的图片尺寸

## 📞 故障排除

### 问题1: 连接失败
- 检查环境变量配置
- 确认Supabase项目URL和Service Key正确

### 问题2: 权限错误
- 确保Service Role Key有足够权限
- 检查RLS策略是否阻止了数据写入

### 问题3: ID冲突
- 脚本使用了UUID格式避免冲突
- 如遇到冲突，使用 --clean 选项

### 问题4: 部分数据导入失败
- 检查SQL语法
- 确认JSON字段格式正确
- 查看错误日志并修复