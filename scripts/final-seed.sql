-- Game Recharge Platform - Final Seed Script
-- Execute this in Supabase SQL Editor

-- Step 1: Temporarily disable RLS for seeding
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE skus DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 2: Create Profiles (using proper UUIDs)
INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'Platform Administrator', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'USER', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create Games (using proper UUIDs)
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '{"en": "Dragon Quest Online", "zh": "龙之传说在线"}', '{"en": "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440102', '{"en": "Magic Academy", "zh": "魔法学院"}', '{"en": "Learn powerful spells, brew magical potions, and uncover ancient mysteries in this enchanting wizarding school RPG.", "zh": "学习强大的咒语，酿造魔法药水，并在这所迷人的巫师学校RPG中揭开古老的秘密。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440103', '{"en": "Elven Kingdom", "zh": "精灵王国"}', '{"en": "Build your elven kingdom, manage resources, and lead your people to glory in this strategic fantasy simulation.", "zh": "建立你的精灵王国，管理资源，并在这款战略奇幻模拟游戏中领导你的人民走向辉煌。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440104', '{"en": "Dragon Riders", "zh": "龙骑士"}', '{"en": "Tame and ride powerful dragons in aerial combat adventures. Explore vast skies and discover hidden dragon sanctuaries.", "zh": "在空中战斗冒险中驯服和骑乘强大的巨龙。探索广阔的天空，发现隐藏的巨龙圣地。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440105', '{"en": "Mystic Realms", "zh": "神秘领域"}', '{"en": "Explore mystical realms filled with ancient magic, powerful artifacts, and dangerous creatures in this open-world RPG.", "zh": "在这个开放世界RPG中探索充满古老魔法、强大物品和危险生物的神秘领域。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440106', '{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}', '{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics and engage in tactical battles across neon-lit cityscapes.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格技术定制你的角色，在霓虹灯闪耀的城市景观中进行战术战斗。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440107', '{"en": "Speed Rivals", "zh": "极速对手"}', '{"en": "High-octane racing action with stunning graphics. Race against players worldwide, customize your vehicles, and dominate the leaderboards in this adrenaline-pumping game.", "zh": "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，定制你的车辆，在这款令人心跳加速的游戏中主导排行榜。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440108', '{"en": "Last Survival", "zh": "最后生存者"}', '{"en": "Drop into an ever-shrinking battlefield and fight to be the last one standing. Scavenge for weapons, craft items, and outlast 99 other players in this intense battle royale.", "zh": "降入不断缩小的战场，战斗成为最后的幸存者。搜寻武器，制作物品，在这场激烈的大逃杀中胜过其他99名玩家。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440109', '{"en": "Space Warriors", "zh": "太空战士"}', '{"en": "Command your fleet in epic space battles. Explore the galaxy, discover new planets, and conquer the universe in this strategic space combat game.", "zh": "在史诗般的太空战斗中指挥你的舰队。探索银河系，发现新行星，征服宇宙，在这款战略太空战斗游戏中。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440110', '{"en": "Zombie Apocalypse", "zh": "僵尸末日"}', '{"en": "Survive in a post-apocalyptic world overrun by zombies. Build shelters, scavenge for resources, and fight for survival against hordes of the undead.", "zh": "在被僵尸占领的后末日世界中生存。建立避难所，搜寻资源，为生存而战，对抗成群的亡灵。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create SKUs for Dragon Quest Online (30 SKUs)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Crystal Packs
('550e8400-e29b-41d4-a716-446655420001', '{"en": "Crystal Pack x50", "zh": "水晶包 x50"}', '{"en": "50 premium crystals to power up your journey. Perfect for beginners.", "zh": "50个高级水晶来助力你的旅程。非常适合初学者。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420002', '{"en": "Crystal Pack x100", "zh": "水晶包 x100"}', '{"en": "100 premium crystals with bonus content exclusive to this pack.", "zh": "100个高级水晶，包含此包独有的奖励内容。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420003', '{"en": "Crystal Pack x250", "zh": "水晶包 x250"}', '{"en": "250 premium crystals with 5% bonus. Great value package.", "zh": "250个高级水晶外加5%奖励。超值套餐。"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420004', '{"en": "Crystal Pack x500", "zh": "水晶包 x500"}', '{"en": "500 premium crystals with extra 10% bonus. Perfect for dedicated players.", "zh": "500个高级水晶外加10%奖励。非常适合专注的玩家。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420005', '{"en": "Crystal Pack x1200", "zh": "水晶包 x1200"}', '{"en": "1200 premium crystals with 25% bonus. The ultimate pack for serious adventurers.", "zh": "1200个高级水晶外加25%奖励。为认真的冒险家准备的终极包。"}', '{"usd": 9999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- Equipment Bundles
('550e8400-e29b-41d4-a716-446655420006', '{"en": "Equipment Bundle Starter", "zh": "装备包新手版"}', '{"en": "Basic equipment set for new adventurers. Includes sword, shield, and basic armor.", "zh": "适合新冒险者的基础装备套装。包含剑、盾牌和基础护甲。"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420007', '{"en": "Equipment Bundle Warrior", "zh": "装备包战士版"}', '{"en": "Warrior equipment set with enhanced stats. Includes legendary sword and heavy armor.", "zh": "战士装备套装，带有增强属性。包含传说级剑和重型护甲。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420008', '{"en": "Equipment Bundle Mage", "zh": "装备包法师版"}', '{"en": "Mage equipment set with magical bonuses. Includes powerful staff and enchanted robes.", "zh": "法师装备套装，带有魔法加成。包含强力法杖和附魔长袍。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420009', '{"en": "Equipment Bundle Elite", "zh": "装备包精英版"}', '{"en": "Elite equipment set with premium stats. Includes rare artifacts and enchanted gear.", "zh": "精英装备套装，带有高级属性。包含稀有物品和附魔装备。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420010', '{"en": "Equipment Bundle Legendary", "zh": "装备包传说版"}', '{"en": "Legendary equipment set with maximum stats. Includes god-tier weapons and divine armor.", "zh": "传说装备套装，满属性值。包含神级武器和神圣护甲。"}', '{"usd": 7999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- Experience Boosts
('550e8400-e29b-41d4-a716-446655420011', '{"en": "Experience Boost 1 Day", "zh": "经验加成 1天"}', '{"en": "Increased experience gain for 1 day. 50% bonus XP from all activities.", "zh": "1天内获得额外经验值。所有活动50%经验加成。"}', '{"usd": 199}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420012', '{"en": "Experience Boost 3 Days", "zh": "经验加成 3天"}', '{"en": "Increased experience gain for 3 days. 50% bonus XP from all activities.", "zh": "3天内获得额外经验值。所有活动50%经验加成。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420013', '{"en": "Experience Boost 7 Days", "zh": "经验加成 7天"}', '{"en": "Increased experience gain for 7 days. 50% bonus XP from all activities.", "zh": "7天内获得额外经验值。所有活动50%经验加成。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420014', '{"en": "Experience Boost 30 Days", "zh": "经验加成 30天"}', '{"en": "Increased experience gain for 30 days. 50% bonus XP from all activities.", "zh": "30天内获得额外经验值。所有活动50%经验加成。"}', '{"usd": 2999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- VIP Status
('550e8400-e29b-41d4-a716-446655420015', '{"en": "VIP Status 7 Days", "zh": "VIP身份 7天"}', '{"en": "VIP access for 7 days with exclusive benefits. Includes premium cosmetics and priority support.", "zh": "7天VIP权限，包含专属福利。包含高级装饰品和优先支持。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420016', '{"en": "VIP Status 30 Days", "zh": "VIP身份 30天"}', '{"en": "VIP access for 30 days with exclusive benefits. Includes premium cosmetics and priority support.", "zh": "30天VIP权限，包含专属福利。包含高级装饰品和优先支持。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420017', '{"en": "VIP Status 90 Days", "zh": "VIP身份 90天"}', '{"en": "VIP access for 90 days with exclusive benefits. Includes premium cosmetics and priority support.", "zh": "90天VIP权限，包含专属福利。包含高级装饰品和优先支持。"}', '{"usd": 9999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420018', '{"en": "VIP Status Lifetime", "zh": "VIP身份 永久"}', '{"en": "Lifetime VIP access with exclusive benefits. Includes premium cosmetics and priority support forever.", "zh": "永久VIP权限，包含专属福利。包含高级装饰品和永久优先支持。"}', '{"usd": 19999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- Mystery Chests
('550e8400-e29b-41d4-a716-446655420019', '{"en": "Mystery Chest x1", "zh": "神秘宝箱 x1"}', '{"en": "1 mystery chest with random rare items. Each chest guaranteed epic or better!", "zh": "1个神秘宝箱，内含随机稀有物品。每个宝箱保证史诗级或更好！"}', '{"usd": 299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420020', '{"en": "Mystery Chest x3", "zh": "神秘宝箱 x3"}', '{"en": "3 mystery chests with random rare items. Each chest guaranteed epic or better!", "zh": "3个神秘宝箱，内含随机稀有物品。每个宝箱保证史诗级或更好！"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420021', '{"en": "Mystery Chest x5", "zh": "神秘宝箱 x5"}', '{"en": "5 mystery chests with random rare items. Each chest guaranteed epic or better!", "zh": "5个神秘宝箱，内含随机稀有物品。每个宝箱保证史诗级或更好！"}', '{"usd": 1299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420022', '{"en": "Mystery Chest x10", "zh": "神秘宝箱 x10"}', '{"en": "10 mystery chests with random rare items. Each chest guaranteed epic or better!", "zh": "10个神秘宝箱，内含随机稀有物品。每个宝箱保证史诗级或更好！"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- Mounts
('550e8400-e29b-41d4-a716-446655420023', '{"en": "Mount Horse", "zh": "坐骑马"}', '{"en": "Basic horse mount with speed bonus. +20% movement speed.", "zh": "基础马匹坐骑，带有速度加成。+20%移动速度。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420024', '{"en": "Mount Wolf", "zh": "坐骑狼"}', '{"en": "Wolf mount with enhanced speed. +30% movement speed.", "zh": "狼坐骑，带有增强速度。+30%移动速度。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420025', '{"en": "Mount Dragon", "zh": "坐骑龙"}', '{"en": "Dragon mount with maximum speed bonus. +50% movement speed.", "zh": "龙坐骑，带有最大速度加成。+50%移动速度。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420026', '{"en": "Mount Phoenix", "zh": "坐骑凤凰"}', '{"en": "Phoenix mount with flying ability. +40% movement speed and flight.", "zh": "凤凰坐骑，带有飞行能力。+40%移动速度和飞行。"}', '{"usd": 6999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420027', '{"en": "Mount Unicorn", "zh": "坐骑独角兽"}', '{"en": "Unicorn mount with magical abilities. +35% movement speed and magic bonus.", "zh": "独角兽坐骑，带有魔法能力。+35%移动速度和魔法加成。"}', '{"usd": 8999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

-- Additional items
('550e8400-e29b-41d4-a716-446655420028', '{"en": "Storage Expansion", "zh": "存储扩展"}', '{"en": "Expand your inventory space. Add 50 extra slots to your inventory.", "zh": "扩展你的背包空间。为你的背包增加50个额外栏位。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420029', '{"en": "Guild Creation", "zh": "公会创建"}', '{"en": "Create your own guild. Includes guild banner and 10 member invitations.", "zh": "创建你自己的公会。包含公会旗帜和10个成员邀请。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655420030', '{"en": "Character Slot", "zh": "角色槽位"}', '{"en": "Unlock additional character slot. Create more characters on your account.", "zh": "解锁额外的角色槽位。在你的账户上创建更多角色。"}', '{"usd": 1499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create Sample Orders
INSERT INTO orders (id, user_id, sku_id, merchant_id, amount, currency, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655430001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655420002', '550e8400-e29b-41d4-a716-446655440002', 999, 'usd', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655430002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655420006', '550e8400-e29b-41d4-a716-446655440002', 1999, 'usd', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655430003', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655420005', '550e8400-e29b-41d4-a716-446655440002', 9999, 'usd', 'pending', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655430004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655420025', '550e8400-e29b-41d4-a716-446655440002', 4999, 'usd', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('550e8400-e29b-41d4-a716-446655430005', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655420021', '550e8400-e29b-41d4-a716-446655440002', 1299, 'usd', 'failed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Step 6: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 7: Verification
SELECT
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;