# 部署 RPC 函数指南

## 方法 1：Supabase Dashboard（推荐）

1. 访问：https://supabase.com/dashboard
2. 选择项目：curtvyynqzjdpjtfosrz
3. 进入 SQL Editor
4. 复制 `supabase/migrations/9999_merchant_analytics_rpc.sql` 内容
5. 粘贴并执行

## 方法 2：命令行（需要 psql）

```bash
psql "postgresql://postgres.curtvyynqzjdpjtfosrz:Rechargea18@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/9999_merchant_analytics_rpc.sql
```

## 验证部署成功

在 SQL Editor 中执行以下查询验证函数创建成功：

```sql
SELECT proname FROM pg_proc WHERE proname LIKE 'get_merchant%';
```

应该看到以下函数：
- get_merchant_analytics
- get_merchant_orders_overview
- get_merchant_products_performance
- get_merchant_revenue_by_game