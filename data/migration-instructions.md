# 🚨 数据迁移指南 - 手动执行

## 问题分析
脚本成功清空了数据库，但没有执行SQL语句。我们需要手动导入数据。

## 📋 解决方案

### 方法1: Supabase Dashboard 导入（推荐）

#### 步骤1: 访问Supabase Dashboard
1. 打开 https://supabase.com/dashboard
2. 选择你的项目：`curtvyynqzjdpjtfosrz`

#### 步骤2: 打开SQL Editor
1. 在左侧菜单找到 "SQL Editor"
2. 点击 "New query"

#### 步骤3: 执行数据导入
复制以下SQL代码到SQL Editor中执行：

```sql
-- =============================================================================
-- Step 1: Import Profiles
-- =============================================================================
INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
('profile-merchant-1', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
('profile-merchant-2', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
('profile-user-1', 'USER', NULL, NOW(), NOW()),
('profile-user-2', 'USER', NULL, NOW(), NOW()),
('profile-admin-1', 'ADMIN', 'Platform Admin', NOW(), NOW());
```

点击 "RUN" 执行，确认成功后继续：

```sql
-- =============================================================================
-- Step 2: Import Games
-- =============================================================================
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
('game-1',
'{"en": "Dragon Quest Online", "zh": "龙之传说在线"}',
'{"en": "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。"}',
'https://placehold.co/1280x720?text=Dragon+Quest+Online&font=playfair-display',
'profile-merchant-1', NOW(), NOW()),

('game-2',
'{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}',
'{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics and engage in tactical battles across neon-lit cityscapes.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格定制你的角色，在霓虹灯闪耀的城市景观中进行战术战斗。"}',
'https://placehold.co/1280x720?text=Cyber+Strike+2077&font=orbitron',
'profile-merchant-1', NOW(), NOW()),

('game-3',
'{"en": "Empire Builder Pro", "zh": "帝国建造者专业版"}',
'{"en": "Build your empire from the ground up. Manage resources, conduct diplomacy, research technologies, and lead your civilization to glory in this deep strategy game.", "zh": "从零开始建立你的帝国。管理资源、进行外交、研究技术，并在这款深度策略游戏中领导你的文明走向辉煌。"}',
'https://placehold.co/1280x720?text=Empire+Builder+Pro&font=merriweather',
'profile-merchant-2', NOW(), NOW()),

('game-4',
'{"en": "Speed Rivals", "zh": "极速对手"}',
'{"en": "High-octane racing action with stunning graphics. Race against players worldwide, customize your vehicles, and dominate the leaderboards in this adrenaline-pumping game.", "zh": "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，定制你的车辆，在这款令人心跳加速的游戏中主导排行榜。"}',
'https://placehold.co/1280x720?text=Speed+Rivals&font=roboto',
'profile-merchant-2', NOW(), NOW()),

('game-5',
'{"en": "Last Survival", "zh": "最后生存者"}',
'{"en": "Drop into an ever-shrinking battlefield and fight to be the last one standing. Scavenge for weapons, craft items, and outlast 99 other players in this intense battle royale.", "zh": "降入不断缩小的战场，战斗成为最后的幸存者。搜寻武器，制作物品，在这场激烈的大逃杀中胜过其他99名玩家。"}',
'https://placehold.co/1280x720?text=Last+Survival&font=bungee',
'profile-merchant-1', NOW(), NOW()),

('game-6',
'{"en": "Mystic Gardens", "zh": "神秘花园"}',
'{"en": "Solve enchanting puzzles in beautifully designed magical gardens. Unlock secrets, discover hidden treasures, and immerse yourself in this relaxing yet challenging puzzle adventure.", "zh": "在精心设计的魔法花园中解决迷人的谜题。解锁秘密，发现隐藏的宝藏，让自己沉浸在这款轻松而又富有挑战性的益智冒险中。"}',
'https://placehold.co/1280x720?text=Mystic+Gardens&font=indie+flower',
'profile-merchant-2', NOW(), NOW());
```

继续执行SKU数据。由于数据量较大，建议分批导入：

#### 步骤4: 验证结果
执行以下查询验证数据是否成功导入：

```sql
-- 验证数据计数
SELECT
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

### 方法2: 分批导入SKU数据

由于SKU数据较多（120个），建议分批导入：

#### 批次1: Dragon Quest Online SKUs (前20个)
```sql
-- Dragon Quest Online SKUs (RPG Game)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
('sku-1-1', '{"en": "Dragon Crystal Pack x50", "zh": "龙水晶包 x50"}', '{"en": "50 premium crystals to power up your journey. Perfect for beginners.", "zh": "50个高级水晶来助力你的旅程。非常适合初学者。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Crystals+x50&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-2', '{"en": "Dragon Crystal Pack x100", "zh": "龙水晶包 x100"}', '{"en": "100 premium crystals with bonus content exclusive to this pack.", "zh": "100个高级水晶，包含此包独有的奖励内容。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Crystals+x100&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-3', '{"en": "Dragon Crystal Pack x250", "zh": "龙水晶包 x250"}', '{"en": "250 premium crystals with 5% bonus. Great value package.", "zh": "250个高级水晶外加5%奖励。超值套餐。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Crystals+x250&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-4', '{"en": "Dragon Crystal Pack x500", "zh": "龙水晶包 x500"}', '{"en": "500 premium crystals with extra 10% bonus. Perfect for dedicated players.", "zh": "500个高级水晶外加10%奖励。非常适合专注的玩家。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Crystals+x500&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-5', '{"en": "Dragon Crystal Pack x1200", "zh": "龙水晶包 x1200"}', '{"en": "1200 premium crystals with 25% bonus. The ultimate pack for serious adventurers.", "zh": "1200个高级水晶外加25%奖励。为认真的冒险家准备的终极包。"}', '{"usd": 9999}', 'https://placehold.co/300x400?text=Crystals+x1200&font=fantasy', 'game-1', NOW(), NOW());
```

继续从`data/mock-data.sql`文件中复制更多SKU数据...

### 方法3: 完整文件导入

如果你想一次性导入所有数据：

1. 打开 `data/mock-data.sql` 文件
2. 复制全部内容（从 "-- Game Recharge Platform Mock Data" 开始）
3. 粘贴到Supabase SQL Editor
4. 点击 "RUN"

## ⚠️ 注意事项

1. **JSON格式**: 确保JSON字段的引号和转义字符正确
2. **UUID格式**: 确保所有ID使用正确的UUID格式
3. **分批执行**: 如果遇到错误，可以分批执行
4. **验证数据**: 每执行一批后都要验证结果

## 🎯 预期结果

成功导入后应该看到：
- profiles: 5 records
- games: 6 records
- skus: 120 records
- orders: 20 records

## 🔧 如果遇到错误

1. **JSON格式错误**: 检查引号是否正确
2. **外键约束**: 确保profiles和games先导入
3. **超时错误**: 分批执行，减少单次数据量

选择一个方法开始导入数据！