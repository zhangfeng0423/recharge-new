-- Game Recharge Platform - Simple Seed Script
-- Run this directly in Supabase SQL Editor

-- Step 1: Create Profiles
INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
('admin-001', 'ADMIN', 'Platform Administrator', NOW(), NOW()),
('merchant-001', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
('merchant-002', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
('user-001', 'USER', NULL, NOW(), NOW());

-- Step 2: Create Games (5 per merchant)
-- Fantasy Games Studio Games
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
('game-001', '{"en": "Dragon Quest Online", "zh": "龙之传说在线"}', '{"en": "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-001', NOW(), NOW()),

('game-002', '{"en": "Magic Academy", "zh": "魔法学院"}', '{"en": "Learn powerful spells, brew magical potions, and uncover ancient mysteries in this enchanting wizarding school RPG.", "zh": "学习强大的咒语，酿造魔法药水，并在这所迷人的巫师学校RPG中揭开古老的秘密。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-001', NOW(), NOW()),

('game-003', '{"en": "Elven Kingdom", "zh": "精灵王国"}', '{"en": "Build your elven kingdom, manage resources, and lead your people to glory in this strategic fantasy simulation.", "zh": "建立你的精灵王国，管理资源，并在这款战略奇幻模拟游戏中领导你的人民走向辉煌。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-001', NOW(), NOW()),

('game-004', '{"en": "Dragon Riders", "zh": "龙骑士"}', '{"en": "Tame and ride powerful dragons in aerial combat adventures. Explore vast skies and discover hidden dragon sanctuaries.", "zh": "在空中战斗冒险中驯服和骑乘强大的巨龙。探索广阔的天空，发现隐藏的巨龙圣地。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-001', NOW(), NOW()),

('game-005', '{"en": "Mystic Realms", "zh": "神秘领域"}', '{"en": "Explore mystical realms filled with ancient magic, powerful artifacts, and dangerous creatures in this open-world RPG.", "zh": "在这个开放世界RPG中探索充满古老魔法、强大物品和危险生物的神秘领域。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-001', NOW(), NOW()),

-- Action Games Inc Games
('game-006', '{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}', '{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格技术定制你的角色。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-002', NOW(), NOW()),

('game-007', '{"en": "Speed Rivals", "zh": "极速对手"}', '{"en": "High-octane racing action with stunning graphics. Race against players worldwide and dominate the leaderboards.", "zh": "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，主导排行榜。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-002', NOW(), NOW()),

('game-008', '{"en": "Last Survival", "zh": "最后生存者"}', '{"en": "Drop into an ever-shrinking battlefield and fight to be the last one standing in this intense battle royale.", "zh": "降入不断缩小的战场，在这场激烈的大逃杀中战斗成为最后的幸存者。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-002', NOW(), NOW()),

('game-009', '{"en": "Space Warriors", "zh": "太空战士"}', '{"en": "Command your fleet in epic space battles. Explore the galaxy, discover new planets, and conquer the universe.", "zh": "在史诗般的太空战斗中指挥你的舰队。探索银河系，发现新行星，征服宇宙。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-002', NOW(), NOW()),

('game-010', '{"en": "Zombie Apocalypse", "zh": "僵尸末日"}', '{"en": "Survive in a post-apocalyptic world overrun by zombies. Build shelters, scavenge for resources, and fight for survival.", "zh": "在被僵尸占领的后末日世界中生存。建立避难所，搜寻资源，为生存而战。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', 'merchant-002', NOW(), NOW());

-- Step 3: Create SKUs (30 per game)
-- Dragon Quest Online SKUs
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Crystal Packs
('sku-001-001', '{"en": "Crystal Pack x50", "zh": "水晶包 x50"}', '{"en": "50 premium crystals to power up your journey.", "zh": "50个高级水晶来助力你的旅程。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-002', '{"en": "Crystal Pack x100", "zh": "水晶包 x100"}', '{"en": "100 premium crystals with bonus content.", "zh": "100个高级水晶，包含奖励内容。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-003', '{"en": "Crystal Pack x250", "zh": "水晶包 x250"}', '{"en": "250 premium crystals with 5% bonus.", "zh": "250个高级水晶外加5%奖励。"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-004', '{"en": "Crystal Pack x500", "zh": "水晶包 x500"}', '{"en": "500 premium crystals with 10% bonus.", "zh": "500个高级水晶外加10%奖励。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-005', '{"en": "Crystal Pack x1200", "zh": "水晶包 x1200"}', '{"en": "1200 premium crystals with 25% bonus.", "zh": "1200个高级水晶外加25%奖励。"}', '{"usd": 9999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),

-- Equipment Bundles
('sku-001-006', '{"en": "Equipment Bundle Starter", "zh": "装备包新手版"}', '{"en": "Basic equipment set for new adventurers.", "zh": "适合新冒险者的基础装备套装。"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-007', '{"en": "Equipment Bundle Warrior", "zh": "装备包战士版"}', '{"en": "Warrior equipment set with enhanced stats.", "zh": "战士装备套装，带有增强属性。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-008', '{"en": "Equipment Bundle Mage", "zh": "装备包法师版"}', '{"en": "Mage equipment set with magical bonuses.", "zh": "法师装备套装，带有魔法加成。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-009', '{"en": "Equipment Bundle Elite", "zh": "装备包精英版"}', '{"en": "Elite equipment set with premium stats.", "zh": "精英装备套装，带有高级属性。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-010', '{"en": "Equipment Bundle Legendary", "zh": "装备包传说版"}', '{"en": "Legendary equipment set with max stats.", "zh": "传说装备套装，满属性值。"}', '{"usd": 7999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),

-- Experience Boosts
('sku-001-011', '{"en": "Experience Boost 1 Day", "zh": "经验加成 1天"}', '{"en": "Increased experience gain for 1 day.", "zh": "1天内获得额外经验值。"}', '{"usd": 199}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-012', '{"en": "Experience Boost 3 Days", "zh": "经验加成 3天"}', '{"en": "Increased experience gain for 3 days.", "zh": "3天内获得额外经验值。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-013', '{"en": "Experience Boost 7 Days", "zh": "经验加成 7天"}', '{"en": "Increased experience gain for 7 days.", "zh": "7天内获得额外经验值。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-014', '{"en": "Experience Boost 30 Days", "zh": "经验加成 30天"}', '{"en": "Increased experience gain for 30 days.", "zh": "30天内获得额外经验值。"}', '{"usd": 2999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),

-- VIP Status
('sku-001-015', '{"en": "VIP Status 7 Days", "zh": "VIP身份 7天"}', '{"en": "VIP access for 7 days with exclusive benefits.", "zh": "7天VIP权限，包含专属福利。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-016', '{"en": "VIP Status 30 Days", "zh": "VIP身份 30天"}', '{"en": "VIP access for 30 days with exclusive benefits.", "zh": "30天VIP权限，包含专属福利。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-017', '{"en": "VIP Status 90 Days", "zh": "VIP身份 90天"}', '{"en": "VIP access for 90 days with exclusive benefits.", "zh": "90天VIP权限，包含专属福利。"}', '{"usd": 9999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-018', '{"en": "VIP Status Lifetime", "zh": "VIP身份 永久"}', '{"en": "Lifetime VIP access with exclusive benefits.", "zh": "永久VIP权限，包含专属福利。"}', '{"usd": 19999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),

-- Mystery Chests
('sku-001-019', '{"en": "Mystery Chest x1", "zh": "神秘宝箱 x1"}', '{"en": "1 mystery chest with random rare items.", "zh": "1个神秘宝箱，内含随机稀有物品。"}', '{"usd": 299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-020', '{"en": "Mystery Chest x3", "zh": "神秘宝箱 x3"}', '{"en": "3 mystery chests with random rare items.", "zh": "3个神秘宝箱，内含随机稀有物品。"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-021', '{"en": "Mystery Chest x5", "zh": "神秘宝箱 x5"}', '{"en": "5 mystery chests with random rare items.", "zh": "5个神秘宝箱，内含随机稀有物品。"}', '{"usd": 1299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-022', '{"en": "Mystery Chest x10", "zh": "神秘宝箱 x10"}', '{"en": "10 mystery chests with random rare items.", "zh": "10个神秘宝箱，内含随机稀有物品。"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),

-- Mounts
('sku-001-023', '{"en": "Mount Horse", "zh": "坐骑马"}', '{"en": "Basic horse mount with speed bonus.", "zh": "基础马匹坐骑，带有速度加成。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-024', '{"en": "Mount Wolf", "zh": "坐骑狼"}', '{"en": "Wolf mount with enhanced speed.", "zh": "狼坐骑，带有增强速度。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-025', '{"en": "Mount Dragon", "zh": "坐骑龙"}', '{"en": "Dragon mount with maximum speed bonus.", "zh": "龙坐骑，带有最大速度加成。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-026', '{"en": "Mount Phoenix", "zh": "坐骑凤凰"}', '{"en": "Phoenix mount with flying ability.", "zh": "凤凰坐骑，带有飞行能力。"}', '{"usd": 6999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-027', '{"en": "Mount Unicorn", "zh": "坐骑独角兽"}', '{"en": "Unicorn mount with magical abilities.", "zh": "独角兽坐骑，带有魔法能力。"}', '{"usd": 8999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW());

-- Additional items to reach 30
('sku-001-028', '{"en": "Storage Expansion", "zh": "存储扩展"}', '{"en": "Expand your inventory space.", "zh": "扩展你的背包空间。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-029', '{"en": "Guild Creation", "zh": "公会创建"}', '{"en": "Create your own guild.", "zh": "创建你自己的公会。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW()),
('sku-001-030', '{"en": "Character Slot", "zh": "角色槽位"}', '{"en": "Unlock additional character slot.", "zh": "解锁额外的角色槽位。"}', '{"usd": 1499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-001', NOW(), NOW());

-- Cyber Strike 2077 SKUs (30 items)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Weapon Packs
('sku-002-001', '{"en": "Weapon Pack Basic", "zh": "武器包基础版"}', '{"en": "Basic weapon collection.", "zh": "基础武器合集。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-002', '{"en": "Weapon Pack Advanced", "zh": "武器包高级版"}', '{"en": "Advanced weapon collection.", "zh": "高级武器合集。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-003', '{"en": "Weapon Pack Elite", "zh": "武器包精英版"}', '{"en": "Elite weapon collection.", "zh": "精英武器合集。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-004', '{"en": "Weapon Pack Legendary", "zh": "武器包传说版"}', '{"en": "Legendary weapon collection.", "zh": "传说武器合集。"}', '{"usd": 7999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Ammo Packs
('sku-002-005', '{"en": "Ammo Pack x100", "zh": "弹药包 x100"}', '{"en": "100 extra ammunition.", "zh": "100个额外弹药。"}', '{"usd": 299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-006', '{"en": "Ammo Pack x500", "zh": "弹药包 x500"}', '{"en": "500 extra ammunition.", "zh": "500个额外弹药。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-007', '{"en": "Ammo Pack x1000", "zh": "弹药包 x1000"}', '{"en": "1000 extra ammunition.", "zh": "1000个额外弹药。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-008', '{"en": "Ammo Pack x5000", "zh": "弹药包 x5000"}', '{"en": "5000 extra ammunition.", "zh": "5000个额外弹药。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Armor Sets
('sku-002-009', '{"en": "Armor Set Light", "zh": "护甲套装轻型"}', '{"en": "Light armor set.", "zh": "轻型护甲套装。"}', '{"usd": 1299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-010', '{"en": "Armor Set Medium", "zh": "护甲套装中型"}', '{"en": "Medium armor set.", "zh": "中型护甲套装。"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-011', '{"en": "Armor Set Heavy", "zh": "护甲套装重型"}', '{"en": "Heavy armor set.", "zh": "重型护甲套装。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-012', '{"en": "Armor Set Elite", "zh": "护甲套装精英版"}', '{"en": "Elite armor set.", "zh": "精英护甲套装。"}', '{"usd": 6999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Battle Pass
('sku-002-013', '{"en": "Battle Pass Season 1", "zh": "战斗通行证第1季"}', '{"en": "Season 1 battle pass.", "zh": "第1季战斗通行证。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-014', '{"en": "Battle Pass Premium", "zh": "高级战斗通行证"}', '{"en": "Premium battle pass.", "zh": "高级战斗通行证。"}', '{"usd": 2999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-015', '{"en": "Battle Pass Elite", "zh": "精英战斗通行证"}', '{"en": "Elite battle pass.", "zh": "精英战斗通行证。"}', '{"usd": 4999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Credits
('sku-002-016', '{"en": "Credits x500", "zh": "积分 x500"}', '{"en": "500 in-game credits.", "zh": "500个游戏内积分。"}', '{"usd": 99}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-017', '{"en": "Credits x1000", "zh": "积分 x1000"}', '{"en": "1000 in-game credits.", "zh": "1000个游戏内积分。"}', '{"usd": 199}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-018', '{"en": "Credits x2500", "zh": "积分 x2500"}', '{"en": "2500 in-game credits.", "zh": "2500个游戏内积分。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-019', '{"en": "Credits x5000", "zh": "积分 x5000"}', '{"en": "5000 in-game credits.", "zh": "5000个游戏内积分。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-020', '{"en": "Credits x10000", "zh": "积分 x10000"}', '{"en": "10000 in-game credits.", "zh": "10000个游戏内积分。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Gadget Bundles
('sku-002-021', '{"en": "Gadget Bundle Basic", "zh": "道具包基础版"}', '{"en": "Basic tactical gadgets.", "zh": "基础战术道具。"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-022', '{"en": "Gadget Bundle Advanced", "zh": "道具包高级版"}', '{"en": "Advanced tactical gadgets.", "zh": "高级战术道具。"}', '{"usd": 1599}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-023', '{"en": "Gadget Bundle Pro", "zh": "道具包专业版"}', '{"en": "Professional tactical gadgets.", "zh": "专业战术道具。"}', '{"usd": 2499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-024', '{"en": "Gadget Bundle Elite", "zh": "道具包精英版"}', '{"en": "Elite tactical gadgets.", "zh": "精英战术道具。"}', '{"usd": 3999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),

-- Additional items to reach 30
('sku-002-025', '{"en": "Character Skin Basic", "zh": "角色皮肤基础版"}', '{"en": "Basic character customization.", "zh": "基础角色定制。"}', '{"usd": 999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-026', '{"en": "Character Skin Premium", "zh": "角色皮肤高级版"}', '{"en": "Premium character customization.", "zh": "高级角色定制。"}', '{"usd": 1999}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-027', '{"en": "Weapon Skin Pack", "zh": "武器皮肤包"}', '{"en": "Collection of weapon skins.", "zh": "武器皮肤合集。"}', '{"usd": 1499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-028', '{"en": "Emote Pack", "zh": "表情包"}', '{"en": "Collection of emotes.", "zh": "表情合集。"}', '{"usd": 799}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-029', '{"en": "Victory Animation", "zh": "胜利动画"}', '{"en": "Custom victory animation.", "zh": "自定义胜利动画。"}', '{"usd": 1299}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW()),
('sku-002-030', '{"en": "Name Change Card", "zh": "改名卡"}', '{"en": "Change your in-game name.", "zh": "更改你的游戏内名称。"}', '{"usd": 499}', 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU', 'game-002', NOW(), NOW());

-- Sample Orders
INSERT INTO orders (id, user_id, sku_id, merchant_id, amount, currency, status, created_at, updated_at) VALUES
('order-001', 'user-001', 'sku-001-002', 'merchant-001', 999, 'usd', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('order-002', 'user-001', 'sku-002-001', 'merchant-002', 999, 'usd', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('order-003', 'user-001', 'sku-001-005', 'merchant-001', 9999, 'usd', 'pending', NOW(), NOW()),
('order-004', 'user-001', 'sku-002-003', 'merchant-002', 3999, 'usd', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('order-005', 'user-001', 'sku-001-025', 'merchant-001', 6999, 'usd', 'failed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Verification
SELECT
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;