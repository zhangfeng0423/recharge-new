# 游戏充值平台数据库架构文档

## 概述

本文档描述了游戏充值平台的完整数据库架构设计，基于PRD.md要求构建的多租户、多语言、安全的数据库系统。

**技术栈**: PostgreSQL 15+ with Supabase, Row Level Security (RLS), JSONB国际化支持

## 📋 目录

1. [表结构设计](#表结构设计)
2. [安全架构](#安全架构)
3. [索引策略](#索引策略)
4. [业务逻辑约束](#业务逻辑约束)
5. [部署指南](#部署指南)
6. [维护与监控](#维护与监控)

## 🏗️ 表结构设计

### 1. `profiles` 表 - 用户档案

扩展示 Supabase `auth.users` 表，实现角色基础的权限控制。

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'MERCHANT', 'ADMIN')),
    merchant_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**字段说明**:
- `id`: 关联到 Supabase 认证用户的主键
- `role`: 用户角色枚举 (USER/MERCHANT/ADMIN)
- `merchant_name`: 仅当role='MERCHANT'时使用
- `created_at`/`updated_at`: 自动时间戳

**业务约束**:
- MERCHANT角色必须提供merchant_name
- 每个认证用户必须有且仅有一个profile记录

### 2. `games` 表 - 游戏信息

存储商户创建的游戏信息，支持多语言内容。

```sql
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    description JSONB,
    banner_url VARCHAR(500),
    merchant_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**字段说明**:
- `name`: JSONB格式，存储多语言游戏名称 `{"en": "Game Name", "zh": "游戏名称"}`
- `description`: JSONB格式，多语言游戏描述
- `banner_url`: 游戏横幅图片URL
- `merchant_id`: 关联到创建游戏的商户

**JSONB约束**:
- `name`字段必须包含`en`和`zh`键
- `description`字段如果存在，必须包含`en`和`zh`键

### 3. `skus` 表 - 商品单位

游戏中可购买的具体商品项目。

```sql
CREATE TABLE public.skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    description JSONB,
    prices JSONB NOT NULL,
    image_url VARCHAR(500),
    game_id UUID NOT NULL REFERENCES public.games(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**字段说明**:
- `name`: JSONB格式，多语言商品名称
- `description`: JSONB格式，多语言商品描述
- `prices`: JSONB格式，价格信息 `{"usd": 1099, "eur": 999}`
- `image_url`: 商品图片URL
- `game_id`: 关联到所属游戏

**价格设计**:
- V1仅支持USD，价格以分为单位存储（$10.99 = 1099）
- JSONB格式为未来多货币扩展预留

### 4. `orders` 表 - 订单记录

跟踪用户购买行为和支付状态。

```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    sku_id UUID NOT NULL REFERENCES public.skus(id),
    merchant_id UUID NOT NULL REFERENCES public.profiles(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    stripe_checkout_session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**字段说明**:
- `user_id`: 购买用户ID
- `sku_id`: 购买的商品ID
- `merchant_id`: 商品所属商户ID（冗余存储，便于查询）
- `amount`: 订单金额（分为单位）
- `currency`: 货币类型（V1固定为'usd'）
- `status`: 订单状态（pending/completed/failed）
- `stripe_checkout_session_id`: Stripe支付会话ID

**订单状态流转**:
1. `pending` - 用户点击购买，创建Stripe会话后
2. `completed` - 支付成功，Webhook回调后
3. `failed` - 支付失败或超时

## 🔒 安全架构

### Row Level Security (RLS) 策略

多租户数据隔离通过PostgreSQL RLS实现，确保严格的权限边界。

#### 权限矩阵

| 表/操作 | USER | MERCHANT | ADMIN |
|---------|------|----------|-------|
| **profiles** | 👁️ 仅自己的 | 👁️ 仅自己的 | 👁️📝🗑️ 全部 |
| **games** | 👁️ 全部 | 👁️📝🗑️ 仅自己的 | 👁️📝🗑️ 全部 |
| **skus** | 👁️ 全部 | 👁️📝🗑️ 自己游戏的 | 👁️📝🗑️ 全部 |
| **orders** | 👁️ 仅自己的 | 👁️ 自己游戏的 | 👁️📝🗑️ 全部 |

#### 关键安全函数

```sql
-- 检查当前用户是否为管理员
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN;

-- 获取商户的游戏ID列表（用于复杂RLS策略）
CREATE OR REPLACE FUNCTION get_merchant_game_ids(p_merchant_id UUID);
```

### 安全最佳实践

1. **最小权限原则**: 每个角色只获得完成其工作所需的最小权限
2. **数据验证**: 所有输入通过CHECK约束和JSONB验证
3. **审计日志**: 所有表包含`created_at`/`updated_at`时间戳
4. **连接池**: 生产环境必须使用PgBouncer连接池
5. **Webhook安全**: Stripe webhook必须验证签名并检查幂等性

## 📊 索引策略

### 性能优化的索引设计

```sql
-- 查询优化索引
CREATE INDEX games_merchant_id_idx ON games(merchant_id);
CREATE INDEX skus_game_id_idx ON skus(game_id);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_merchant_id_idx ON orders(merchant_id);
CREATE INDEX orders_status_idx ON orders(status);

-- 复合索引（仪表板查询优化）
CREATE INDEX orders_merchant_status_idx ON orders(merchant_id, status);

-- GIN索引（JSONB字段查询）
CREATE INDEX games_name_gin_idx ON games USING GIN(name);
CREATE INDEX skus_prices_gin_idx ON skus USING GIN(prices);

-- 唯一索引（业务约束）
CREATE UNIQUE INDEX orders_stripe_session_idx ON orders(stripe_checkout_session_id);
```

### 查询模式优化

1. **商户仪表板**: `orders_merchant_status_idx` 优化状态统计查询
2. **游戏列表**: `games_merchant_id_idx` 优化商户游戏查询
3. **订单搜索**: 复合索引支持按用户和状态查询
4. **JSONB搜索**: GIN索引支持多语言内容搜索

## 🔧 业务逻辑约束

### 数据完整性约束

1. **外键约束**: 确保引用完整性
2. **CHECK约束**: 验证枚举值和数据范围
3. **JSONB验证**: 确保多语言字段格式正确
4. **业务约束**: MERCHANT必须提供merchant_name

### 触发器

```sql
-- 自动更新时间戳
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 分析视图

```sql
-- 商户分析仪表板视图
CREATE VIEW merchant_analytics AS
SELECT
    p.id as merchant_id,
    p.merchant_name,
    COUNT(DISTINCT g.id) as total_games,
    COUNT(DISTINCT s.id) as total_skus,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.amount), 0) as total_revenue
FROM public.profiles p
-- ... 关联查询 ...
```

## 🚀 部署指南

### 1. 环境准备

```bash
# 安装 Supabase CLI
npm install -g @supabase/cli

# 复制环境变量模板
cp .env.local.example .env.local
# 填入实际的 Supabase 配置
```

### 2. 数据库迁移

```bash
# 启动本地 Supabase
supabase start

# 应用迁移文件
supabase db push
```

### 3. 权限设置

```sql
-- 创建管理员用户（需要先在 auth.users 中创建）
INSERT INTO public.profiles (id, role, merchant_name)
VALUES ('admin-uuid-here', 'ADMIN', NULL);
```

### 4. 生产环境配置

1. **连接池**: 必须使用PgBouncer URL
2. **RLS验证**: 确保所有RLS策略正确启用
3. **索引检查**: 验证所有索引已创建
4. **监控设置**: 配置数据库性能监控

## 🔍 维护与监控

### 性能监控指标

1. **查询性能**: 监控慢查询和索引使用情况
2. **连接池**: 监控PgBouncer连接数和等待时间
3. **RLS策略**: 监控权限检查的性能影响
4. **JSONB查询**: 监控JSON字段的查询效率

### 备份策略

1. **实时备份**: Supabase自动实时备份
2. **定期备份**: 每日全量备份
3. **备份验证**: 定期测试备份恢复流程

### 维护任务

```sql
-- 定期统计信息更新
ANALYZE;

-- 重建索引（如果需要）
REINDEX INDEX CONCURRENTLY games_name_gin_idx;

-- 清理过期会话（如果应用实现会话管理）
DELETE FROM user_sessions WHERE expires_at < NOW();
```

## 📚 参考资料

- [PostgreSQL RLS文档](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS指南](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB最佳实践](https://www.postgresql.org/docs/current/datatype-json.html)
- [数据库索引优化](https://www.postgresql.org/docs/current/indexes.html)

## 🛠️ 相关文件

- `supabase/migrations/20250109_001_initial_schema.sql` - 完整迁移文件
- `src/lib/supabase-types.ts` - TypeScript类型定义
- `.env.local.example` - 环境变量模板
- `game-recharge-schema.ts` - Zod Schema定义

---

**版本**: 1.0
**创建日期**: 2025-01-09
**维护者**: 游戏充值平台开发团队