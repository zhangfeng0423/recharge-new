-- Quick Import SQL for Game Recharge Platform
-- Copy this entire file and paste into Supabase SQL Editor

-- Step 1: Import Profiles
INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
('profile-merchant-1', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
('profile-merchant-2', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
('profile-user-1', 'USER', NULL, NOW(), NOW()),
('profile-user-2', 'USER', NULL, NOW(), NOW()),
('profile-admin-1', 'ADMIN', 'Platform Admin', NOW(), NOW());

-- Step 2: Import Games
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
('game-1',
'{"en": "Dragon Quest Online", "zh": "龙之传说在线"}',
'{"en": "Embark on an epic adventure in a vast fantasy world.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。"}',
'https://placehold.co/1280x720?text=Dragon+Quest+Online',
'profile-merchant-1', NOW(), NOW()),

('game-2',
'{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}',
'{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。"}',
'https://placehold.co/1280x720?text=Cyber+Strike+2077',
'profile-merchant-1', NOW(), NOW()),

('game-3',
'{"en": "Empire Builder Pro", "zh": "帝国建造者专业版"}',
'{"en": "Build your empire from the ground up. Manage resources, conduct diplomacy.", "zh": "从零开始建立你的帝国。管理资源、进行外交。"}',
'https://placehold.co/1280x720?text=Empire+Builder+Pro',
'profile-merchant-2', NOW(), NOW()),

('game-4',
'{"en": "Speed Rivals", "zh": "极速对手"}',
'{"en": "High-octane racing action with stunning graphics. Race against players worldwide.", "zh": "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛。"}',
'https://placehold.co/1280x720?text=Speed+Rivals',
'profile-merchant-2', NOW(), NOW()),

('game-5',
'{"en": "Last Survival", "zh": "最后生存者"}',
'{"en": "Drop into an ever-shrinking battlefield and fight to be the last one standing.", "zh": "降入不断缩小的战场，战斗成为最后的幸存者。"}',
'https://placehold.co/1280x720?text=Last+Survival',
'profile-merchant-1', NOW(), NOW()),

('game-6',
'{"en": "Mystic Gardens", "zh": "神秘花园"}',
'{"en": "Solve enchanting puzzles in beautifully designed magical gardens.", "zh": "在精心设计的魔法花园中解决迷人的谜题。"}',
'https://placehold.co/1280x720?text=Mystic+Gardens',
'profile-merchant-2', NOW(), NOW());

-- Step 3: Import Sample SKUs (First 6 for each game to start)
-- Dragon Quest Online SKUs
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
('sku-1-1', '{"en": "Dragon Crystal Pack x100", "zh": "龙水晶包 x100"}', '{"en": "100 premium crystals to power up your journey.", "zh": "100个高级水晶来助力你的旅程。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Crystals+x100&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-2', '{"en": "Dragon Crystal Pack x500", "zh": "龙水晶包 x500"}', '{"en": "500 premium crystals with extra 10% bonus.", "zh": "500个高级水晶外加10%奖励。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Crystals+x500&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-3', '{"en": "Starter Bundle", "zh": "新手包"}', '{"en": "50 crystals + basic equipment + exclusive mount.", "zh": "50个水晶+基础装备+专属坐骑。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Starter+Bundle&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-4', '{"en": "Dragon Armor Set", "zh": "龙之套装"}', '{"en": "Complete legendary armor set with dragon-scale protection.", "zh": "完整的传说级套装，带有龙鳞保护。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Dragon+Armor&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-5', '{"en": "Phoenix Mount", "zh": "凤凰坐骑"}', '{"en": "Rare flying phoenix mount with +30% movement speed.", "zh": "稀有的飞行凤凰坐骑，+30%移动速度。"}', '{"usd": 5999}', 'https://placehold.co/300x400?text=Phoenix+Mount&font=fantasy', 'game-1', NOW(), NOW()),
('sku-1-6', '{"en": "VIP Status x30", "zh": "VIP身份 x30天"}', '{"en": "30 days VIP access with exclusive cosmetics and priority support.", "zh": "30天VIP权限，包含专属装饰品和优先支持。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=VIP+Status&font=fantasy', 'game-1', NOW(), NOW()),

-- Cyber Strike 2077 SKUs
('sku-2-1', '{"en": "Weapon Pack x5", "zh": "武器包 x5"}', '{"en": "5 rare weapons including 1 legendary. Randomly selected.", "zh": "5把稀有武器，包含1把传说级。随机选择。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Weapons+x5&font=cyber', 'game-2', NOW(), NOW()),
('sku-2-2', '{"en": "Cyber Credits x1000", "zh": "赛博积分 x1000"}', '{"en": "1000 credits for customizing your character with cybernetics.", "zh": "1000个积分，用于使用赛博格技术定制你的角色。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Credits+x1000&font=cyber', 'game-2', NOW(), NOW()),
('sku-2-3', '{"en": "Battle Pass Season 1", "zh": "战斗通行证第1季"}', '{"en": "Unlock exclusive rewards throughout Season 1. 50 levels.", "zh": "在第1季期间解锁独家奖励。包含50个进度等级。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Battle+Pass&font=cyber', 'game-2', NOW(), NOW()),
('sku-2-4', '{"en": "Cybernetic Enhancement Kit", "zh": "赛博格增强包"}', '{"en": "Advanced cybernetics for +15% accuracy and +10% reload speed.", "zh": "高级赛博格植入物，+15%精准度和+10%换弹速度。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Enhancement+Kit&font=cyber', 'game-2', NOW(), NOW()),
('sku-2-5', '{"en": "Drone Companion", "zh": "无人机伴侣"}', '{"en": "Tactical drone that spots enemies and provides ammo resupply.", "zh": "战术无人机伴侣，可发现敌人并提供弹药补给。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Drone+Companion&font=cyber', 'game-2', NOW(), NOW()),
('sku-2-6', '{"en": "Elite Squad Bundle", "zh": "精英小队包"}', '{"en": "4-player squad bundle with matching skins and squad bonuses.", "zh": "4人小队包，包含匹配皮肤和小队奖励。"}', '{"usd": 8999}', 'https://placehold.co/300x400?text=Squad+Bundle&font=cyber', 'game-2', NOW(), NOW()),

-- Empire Builder Pro SKUs
('sku-3-1', '{"en": "Resource Pack Medium", "zh": "中型资源包"}', '{"en": "Instant boost: 1000 gold, 500 wood, 300 stone, 200 food.", "zh": "资源即时提升：1000金币、500木材、300石头、200食物。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Resources&font=serif', 'game-3', NOW(), NOW()),
('sku-3-2', '{"en": "Advanced Technology Pack", "zh": "高级技术包"}', '{"en": "Skip research time and unlock 5 random advanced technologies instantly.", "zh": "跳过研究时间并立即解锁5个随机高级技术。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Tech+Pack&font=serif', 'game-3', NOW(), NOW()),
('sku-3-3', '{"en": "Premium DLC: Ancient Civilizations", "zh": "高级DLC：古代文明"}', '{"en": "Add new ancient civilizations to play with unique units and buildings.", "zh": "添加新的古代文明供游玩，具有独特的单位和建筑。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Ancient+Civs&font=serif', 'game-3', NOW(), NOW()),
('sku-3-4', '{"en": "Economic Boost Pack", "zh": "经济加成包"}', '{"en": "+25% resource generation for 7 days. Stackable with other boosts.", "zh": "7天内+25%资源生成。可与其他加成叠加。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Economic+Boost&font=serif', 'game-3', NOW(), NOW()),
('sku-3-5', '{"en": "Wonder Blueprint Pack", "zh": "奇迹蓝图包"}', '{"en": "3 exclusive world wonder blueprints with unique bonuses.", "zh": "3个专属世界奇迹蓝图，具有独特奖励。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Wonder+Blueprints&font=serif', 'game-3', NOW(), NOW()),
('sku-3-6', '{"en": "Empire Starter Kit", "zh": "帝国启动包"}', '{"en": "Complete beginner bundle: resources, technologies, and exclusive advisor.", "zh": "完整新手包：资源、技术和专属顾问。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Empire+Starter&font=serif', 'game-3', NOW(), NOW()),

-- Speed Rivals SKUs
('sku-4-1', '{"en": "Nitro Boost x50", "zh": "氮气加速 x50"}', '{"en": "50 nitro boosts with unlimited use for 7 days.", "zh": "50次氮气加速，7天内无限使用。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Nitro+x50&font=racing', 'game-4', NOW(), NOW()),
('sku-4-2', '{"en": "Car Pack: Exotics", "zh": "汽车包：异国风情"}', '{"en": "Unlock 3 exclusive exotic cars with custom liveries and enhanced stats.", "zh": "解锁3辆专属异国汽车，具有定制涂装和增强属性。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Exotic+Cars&font=racing', 'game-4', NOW(), NOW()),
('sku-4-3', '{"en": "Super Car Elite Pack", "zh": "超跑精英包"}', '{"en": "4 legendary supercars with max stats and unique abilities.", "zh": "4辆传奇级超跑，满属性和独特能力。"}', '{"usd": 8999}', 'https://placehold.co/300x400?text=Super+Cars&font=racing', 'game-4', NOW(), NOW()),
('sku-4-4', '{"en": "Custom Paint Job Bundle", "zh": "定制涂装包"}', '{"en": "20 exclusive paint colors and 5 custom graphic designs.", "zh": "20种专属颜色和5个自定义图形设计。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Custom+Paint&font=racing', 'game-4', NOW(), NOW()),
('sku-4-5', '{"en": "Neon Underglow Kit", "zh": "霓虹底盘灯包"}', '{"en": "RGB neon underglow system with 50 color combinations and sync modes.", "zh": "RGB霓虹底盘灯系统，50种颜色组合和同步模式。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Neon+Underglow&font=racing', 'game-4', NOW(), NOW()),
('sku-4-6', '{"en": "Elite Driver Bundle", "zh": "精英驾驶员包"}', '{"en": "Complete starter bundle: premium car, boosts, customizations, and VIP status.", "zh": "完整新手包：高级汽车、加成、定制和VIP身份。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Elite+Driver&font=racing', 'game-4', NOW(), NOW()),

-- Last Survival SKUs
('sku-5-1', '{"en": "Supply Drop Bundle", "zh": "补给空投包"}', '{"en": "3 premium supply drops with guaranteed rare items.", "zh": "3个高级补给空投，保证稀有物品。"}', '{"usd": 599}', 'https://placehold.co/300x400?text=Supply+Bundle&font=military', 'game-5', NOW(), NOW()),
('sku-5-2', '{"en": "Battle Coin Pack x1000", "zh": "战斗硬币包 x1000"}', '{"en": "1000 battle coins for purchasing exclusive weapons and equipment.", "zh": "1000个战斗硬币，用于购买专属武器和装备。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Battle+Coins&font=military', 'game-5', NOW(), NOW()),
('sku-5-3', '{"en": "Elite Weapon Pack", "zh": "精英武器包"}', '{"en": "Guaranteed rare or legendary weapon in every pack. Best value!", "zh": "每包都保证稀有或传说级武器。超值！"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Elite+Weapons&font=military', 'game-5', NOW(), NOW()),
('sku-5-4', '{"en": "Victory Royale Pass", "zh": "胜利大逃杀通行证"}', '{"en": "Unlock exclusive victory cosmetics and celebration emotes.", "zh": "解锁专属胜利装饰品和庆祝表情。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Victory+Pass&font=military', 'game-5', NOW(), NOW()),
('sku-5-5', '{"en": "Stealth Camo System", "zh": "隐身迷彩系统"}', '{"en": "Active camouflage for 10 seconds. 3 uses per match.", "zh": "主动迷彩10秒。每场比赛3次使用。"}', '{"usd": 2299}', 'https://placehold.co/300x400?text=Stealth+Camo&font=military', 'game-5', NOW(), NOW()),
('sku-5-6', '{"en": "Battle Royale Champion Pack", "zh": "大逃杀冠军包"}', '{"en": "Ultimate bundle: legendary weapons, elite armor, and champion status.", "zh": "终极包：传说武器、精英护甲和冠军身份。"}', '{"usd": 9999}', 'https://placehold.co/300x400?text=Champion+Pack&font=military', 'game-5', NOW(), NOW()),

-- Mystic Gardens SKUs
('sku-6-1', '{"en": "Hint Pack x5", "zh": "提示包 x5"}', '{"en": "5 hints to help you solve the most challenging puzzles.", "zh": "5个提示来帮助你解决最具挑战性的谜题。"}', '{"usd": 299}', 'https://placehold.co/300x400?text=Hints+x5&font=floral', 'game-6', NOW(), NOW()),
('sku-6-2', '{"en": "Unlock All Gardens", "zh": "解锁所有花园"}', '{"en": "Instant access to all current and future gardens.", "zh": "立即访问所有当前和未来的花园。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=All+Gardens&font=floral', 'game-6', NOW(), NOW()),
('sku-6-3', '{"en": "Power-Up Bundle", "zh": "强化包"}', '{"en": "Collection of useful power-ups: time freeze, unlimited moves, and auto-solve.", "zh": "有用的强化道具集合：时间冻结、无限移动和自动解决。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Power+Ups&font=floral', 'game-6', NOW(), NOW()),
('sku-6-4', '{"en": "Garden Decoration Pack", "zh": "花园装饰包"}', '{"en": "50 decorative items to customize your garden spaces.", "zh": "50个装饰物品，用于定制你的花园空间。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Garden+Decor&font=floral', 'game-6', NOW(), NOW()),
('sku-6-5', '{"en": "Magic Wand Collection", "zh": "魔法棒合集"}', '{"en": "Set of magical tools to solve impossible puzzles instantly.", "zh": "一套魔法工具，可立即解决不可能的谜题。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Magic+Wand&font=floral', 'game-6', NOW(), NOW()),
('sku-6-6', '{"en": "Premium Membership", "zh": "高级会员"}', '{"en": "Unlimited access to all premium features and exclusive content.", "zh": "无限制访问所有高级功能和独家内容。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Premium+Membership&font=floral', 'game-6', NOW(), NOW());

-- Step 4: Import Sample Orders
INSERT INTO orders (id, user_id, sku_id, merchant_id, amount, currency, status, created_at, updated_at) VALUES
('order-1', 'profile-user-1', 'sku-1-2', 'profile-merchant-1', 4999, 'usd', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('order-2', 'profile-user-2', 'sku-2-1', 'profile-merchant-1', 1499, 'usd', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('order-3', 'profile-user-1', 'sku-3-1', 'profile-merchant-2', 999, 'usd', 'pending', NOW(), NOW()),
('order-4', 'profile-user-2', 'sku-4-2', 'profile-merchant-2', 999, 'usd', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('order-5', 'profile-user-1', 'sku-5-3', 'profile-merchant-1', 999, 'usd', 'failed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Step 5: Verify Import
SELECT
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'skus', COUNT(*) FROM skus
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;