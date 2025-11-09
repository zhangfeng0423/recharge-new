-- Game Recharge Platform Mock Data
-- Using placehold.co for images and realistic game content

-- Profiles (Users/Merchants)
INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
('b1fccb00-0d1c-4f09-cc7e-7cc0ce491b22', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
('c2gddc11-1e2d-4f10-dd8f-8dd1df502c33', 'USER', NULL, NOW(), NOW()),
('d3heee22-2f3e-4f21-ee90-9ee2ef613d44', 'USER', NULL, NOW(), NOW()),
('e4ifff33-3g4f-4f32-ff01-af33fg724e55', 'ADMIN', 'Platform Admin', NOW(), NOW());

-- Games
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
-- Fantasy RPG Game
('game-1',
'{"en": "Dragon Quest Online", "zh": "龙之传说在线"}',
'{"en": "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。"}',
'https://placehold.co/1280x720?text=Dragon+Quest+Online&font=playfair-display',
'profile-merchant-1', NOW(), NOW()),

-- Action Shooter Game
('game-2',
'{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}',
'{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics and engage in tactical battles across neon-lit cityscapes.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格定制你的角色，在霓虹灯闪耀的城市景观中进行战术战斗。"}',
'https://placehold.co/1280x720?text=Cyber+Strike+2077&font=orbitron',
'profile-merchant-1', NOW(), NOW()),

-- Strategy Game
('game-3',
'{"en": "Empire Builder Pro", "zh": "帝国建造者专业版"}',
'{"en": "Build your empire from the ground up. Manage resources, conduct diplomacy, research technologies, and lead your civilization to glory in this deep strategy game.", "zh": "从零开始建立你的帝国。管理资源、进行外交、研究技术，并在这款深度策略游戏中领导你的文明走向辉煌。"}',
'https://placehold.co/1280x720?text=Empire+Builder+Pro&font=merriweather',
'profile-merchant-2', NOW(), NOW()),

-- Mobile Racing Game
('game-4',
'{"en": "Speed Rivals", "zh": "极速对手"}',
'{"en": "High-octane racing action with stunning graphics. Race against players worldwide, customize your vehicles, and dominate the leaderboards in this adrenaline-pumping game.", "zh": "拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，定制你的车辆，在这款令人心跳加速的游戏中主导排行榜。"}',
'https://placehold.co/1280x720?text=Speed+Rivals&font=roboto',
'profile-merchant-2', NOW(), NOW()),

-- Battle Royale Game
('game-5',
'{"en": "Last Survival", "zh": "最后生存者"}',
'{"en": "Drop into an ever-shrinking battlefield and fight to be the last one standing. Scavenge for weapons, craft items, and outlast 99 other players in this intense battle royale.", "zh": "降入不断缩小的战场，战斗成为最后的幸存者。搜寻武器，制作物品，在这场激烈的大逃杀中胜过其他99名玩家。"}',
'https://placehold.co/1280x720?text=Last+Survival&font=bungee',
'profile-merchant-1', NOW(), NOW()),

-- Puzzle Adventure Game
('game-6',
'{"en": "Mystic Gardens", "zh": "神秘花园"}',
'{"en": "Solve enchanting puzzles in beautifully designed magical gardens. Unlock secrets, discover hidden treasures, and immerse yourself in this relaxing yet challenging puzzle adventure.", "zh": "在精心设计的魔法花园中解决迷人的谜题。解锁秘密，发现隐藏的宝藏，让自己沉浸在这款轻松而又富有挑战性的益智冒险中。"}',
'https://placehold.co/1280x720?text=Mystic+Gardens&font=indie+flower',
'profile-merchant-2', NOW(), NOW());

-- SKUs for each game (approximately 20 per game)

-- Dragon Quest Online SKUs (RPG Game)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Crystal Packs
('sku-1-1', '{"en": "Dragon Crystal Pack x50", "zh": "龙水晶包 x50"}', '{"en": "50 premium crystals to power up your journey. Perfect for beginners.", "zh": "50个高级水晶来助力你的旅程。非常适合初学者。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Crystals+x50&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-2', '{"en": "Dragon Crystal Pack x100", "zh": "龙水晶包 x100"}', '{"en": "100 premium crystals with bonus content exclusive to this pack.", "zh": "100个高级水晶，包含此包独有的奖励内容。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Crystals+x100&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-3', '{"en": "Dragon Crystal Pack x250", "zh": "龙水晶包 x250"}', '{"en": "250 premium crystals with 5% bonus. Great value package.", "zh": "250个高级水晶外加5%奖励。超值套餐。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Crystals+x250&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-4', '{"en": "Dragon Crystal Pack x500", "zh": "龙水晶包 x500"}', '{"en": "500 premium crystals with extra 10% bonus. Perfect for dedicated players.", "zh": "500个高级水晶外加10%奖励。非常适合专注的玩家。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Crystals+x500&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-5', '{"en": "Dragon Crystal Pack x1200", "zh": "龙水晶包 x1200"}', '{"en": "1200 premium crystals with 25% bonus. The ultimate pack for serious adventurers.", "zh": "1200个高级水晶外加25%奖励。为认真的冒险家准备的终极包。"}', '{"usd": 9999}', 'https://placehold.co/300x400?text=Crystals+x1200&font=fantasy', 'game-1', NOW(), NOW()),

-- Equipment & Items
('sku-1-6', '{"en": "Mystic Sword Bundle", "zh": "神秘之剑包"}', '{"en": "Bundle of 3 rare swords with enhanced stats. Limited time offer!", "zh": "3把稀有剑的捆绑包，带有增强属性。限时优惠！"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Mystic+Swords&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-7', '{"en": "Dragon Armor Set", "zh": "龙之套装"}', '{"en": "Complete legendary armor set with dragon-scale protection. +50 defense bonus.", "zh": "完整的传说级套装，带有龙鳞保护。+50防御加成。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Dragon+Armor&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-8', '{"en": "Magic Spell Collection", "zh": "魔法咒语合集"}', '{"en": "Collection of 5 powerful spells including fire, ice, and lightning.", "zh": "5个强力咒语的合集，包括火、冰和雷。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Magic+Spells&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-9', '{"en": "Phoenix Mount", "zh": "凤凰坐骑"}', '{"en": "Rare flying phoenix mount with +30% movement speed.", "zh": "稀有的飞行凤凰坐骑，+30%移动速度。"}', '{"usd": 5999}', 'https://placehold.co/300x400?text=Phoenix+Mount&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-10', '{"en": "Starter Bundle", "zh": "新手包"}', '{"en": "50 crystals + basic equipment + exclusive mount. Perfect for new players.", "zh": "50个水晶+基础装备+专属坐骑。非常适合新玩家。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Starter+Bundle&font=fantasy', 'game-1', NOW(), NOW()),

-- Special Items
('sku-1-11', '{"en": "Legendary Dragon Egg", "zh": "传说龙蛋"}', '{"en": "Hatch your own baby dragon companion. Ultra rare!", "zh": "孵化你自己的龙宝宝伴侣。极度稀有！"}', '{"usd": 14999}', 'https://placehold.co/300x400?text=Dragon+Egg&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-12', '{"en": "Guild Founder Pack", "zh": "公会创始人包"}', '{"en": "Create your own guild + 10 member invitations + exclusive guild banner.", "zh": "创建自己的公会+10个成员邀请+专属公会旗帜。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Guild+Pack&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-13', '{"en": "Experience Boost x7", "zh": "经验加成 x7天"}', '{"en": "50% increased experience gain for 7 days. Stackable!", "zh": "7天内获得50%额外经验。可叠加！"}', '{"usd": 699}', 'https://placehold.co/300x400?text=XP+Boost&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-14', '{"en": "Gold Boost x30", "zh": "金币加成 x30天"}', '{"en": "Double gold drops for 30 days. Massive farming advantage!", "zh": "30天内双倍金币掉落。巨大刷怪优势！"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Gold+Boost&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-15', '{"en": "Mystery Chest x5", "zh": "神秘宝箱 x5"}', '{"en": "5 mystery chests with random rare items. Each chest guaranteed epic or better!", "zh": "5个神秘宝箱，内含随机稀有物品。每个宝箱保证史诗级或更好！"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Mystery+Chest&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-16', '{"en": "Enchantment Stones x20", "zh": "附魔石 x20"}', '{"en": "20 stones to upgrade your equipment to +15 enhancement level.", "zh": "20颗石头，可将装备升级到+15强化等级。"}', '{"usd": 1899}', 'https://placehold.co/300x400?text=Enchant+Stones&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-17', '{"en": "Teleport Scrolls x50", "zh": "传送卷轴 x50"}', '{"en": "50 instant teleportation scrolls to any discovered location.", "zh": "50张瞬时传送卷轴，可传送到任何已发现的位置。"}', '{"usd": 599}', 'https://placehold.co/300x400?text=Teleport+Scrolls&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-18', '{"en": "Inventory Expansion", "zh": "背包扩展"}', '{"en": "Add 50 extra slots to your inventory. Never run out of space again!", "zh": "为你的背包增加50个额外栏位。再也不会空间不足！"}', '{"usd": 899}', 'https://placehold.co/300x400?text=Inventory+Expand&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-19', '{"en": "Premium Storage Chest", "zh": "高级储物箱"}', '{"en": "Secure chest with 100 slots for storing valuable items and cosmetics.", "zh": "安全储物箱，100个栏位，用于存放贵重物品和装饰品。"}', '{"usd": 1599}', 'https://placehold.co/300x400?text=Storage+Chest&font=fantasy', 'game-1', NOW(), NOW()),

('sku-1-20', '{"en": "VIP Status x30", "zh": "VIP身份 x30天"}', '{"en": "30 days VIP access: exclusive cosmetics, priority support, and special chat badge.", "zh": "30天VIP权限：专属装饰品、优先支持和特殊聊天徽章。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=VIP+Status&font=fantasy', 'game-1', NOW(), NOW());

-- Cyber Strike 2077 SKUs (Action Shooter)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Weapon Packs
('sku-2-1', '{"en": "Starter Weapon Pack", "zh": "新手武器包"}', '{"en": "3 basic weapons including pistol, rifle, and SMG. Perfect for new players.", "zh": "3把基础武器，包括手枪、步枪和冲锋枪。非常适合新玩家。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Starter+Weapons&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-2', '{"en": "Weapon Pack x5", "zh": "武器包 x5"}', '{"en": "5 rare weapons including 1 legendary. Randomly selected from current meta.", "zh": "5把稀有武器，包含1把传说级。从当前环境中随机选择。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Weapons+x5&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-3', '{"en": "Elite Weapon Pack x10", "zh": "精英武器包 x10"}', '{"en": "10 rare weapons including 2 legendaries. Enhanced drop rates.", "zh": "10把稀有武器，包含2把传说级。增强掉落率。"}', '{"usd": 2799}', 'https://placehold.co/300x400?text=Elite+Weapons&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-4', '{"en": "Weapon Pack x15", "zh": "武器包 x15"}', '{"en": "15 rare weapons including 3 legendaries. Enhanced drop rates.", "zh": "15把稀有武器，包含3把传说级。增强掉落率。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Weapons+x15&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-5', '{"en": "Ultimate Arsenal", "zh": "终极军火库"}', '{"en": "25 weapons including 5 legendaries and exclusive skins. The complete collection!", "zh": "25把武器，包含5把传说级和专属皮肤。完整收藏！"}', '{"usd": 7999}', 'https://placehold.co/300x400?text=Ultimate+Arsenal&font=cyber', 'game-2', NOW(), NOW()),

-- Currency & Credits
('sku-2-6', '{"en": "Cyber Credits x500", "zh": "赛博积分 x500"}', '{"en": "500 credits for basic cosmetic items and weapon attachments.", "zh": "500个积分，用于基础装饰品和武器配件。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Credits+x500&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-7', '{"en": "Cyber Credits x1000", "zh": "赛博积分 x1000"}', '{"en": "1000 credits for customizing your character with the latest cybernetics.", "zh": "1000个积分，用于使用最新的赛博格技术定制你的角色。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Credits+x1000&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-8', '{"en": "Cyber Credits x2500", "zh": "赛博积分 x2500"}', '{"en": "2500 credits with 10% bonus. Premium cybernetic upgrades and exclusive items.", "zh": "2500个积分，10%奖励。高级赛博格升级和专属物品。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Credits+x2500&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-9', '{"en": "Cyber Credits x5000", "zh": "赛博积分 x5000"}', '{"en": "5000 credits with 20% bonus. Ultimate customization package.", "zh": "5000个积分，20%奖励。终极定制包。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Credits+x5000&font=cyber', 'game-2', NOW(), NOW()),

-- Battle Pass & Seasons
('sku-2-10', '{"en": "Battle Pass Season 1", "zh": "战斗通行证第1季"}', '{"en": "Unlock exclusive rewards and premium content throughout Season 1. 50 levels.", "zh": "在第1季期间解锁独家奖励和高级内容。包含50个进度等级。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Battle+Pass&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-11', '{"en": "Battle Pass Premium", "zh": "高级战斗通行证"}', '{"en": "Premium Battle Pass with exclusive cosmetics and bonus XP multiplier.", "zh": "高级战斗通行证，包含独家装饰品和经验值加成。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Premium+Pass&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-12', '{"en": "Season Bundle All Access", "zh": "季票全通包"}', '{"en": "Current season pass + 5 exclusive legendary weapon skins.", "zh": "当季通行证+5个专属传说级武器皮肤。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=All+Access&font=cyber', 'game-2', NOW(), NOW()),

-- Special Items
('sku-2-13', '{"en": "Cybernetic Enhancement Kit", "zh": "赛博格增强包"}', '{"en": "Advanced cybernetics for +15% accuracy and +10% reload speed.", "zh": "高级赛博格植入物，+15%精准度和+10%换弹速度。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Enhancement+Kit&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-14', '{"en": "Drone Companion", "zh": "无人机伴侣"}', '{"en": "Tactical drone companion that spots enemies and provides ammo resupply.", "zh": "战术无人机伴侣，可发现敌人并提供弹药补给。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Drone+Companion&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-15', '{"en": "Holographic Decoy Pack", "zh": "全息诱饵包"}', '{"en": "5 holographic decoys to confuse enemies. Great for tactical retreats.", "zh": "5个全息诱饵，用于迷惑敌人。非常适合战术撤退。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Holo+Decoy&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-16', '{"en": "Armor Plating Upgrade", "zh": "装甲板升级"}', '{"en": "Advanced armor plating for +25% damage resistance in combat.", "zh": "高级装甲板，战斗中+25%伤害抗性。"}', '{"usd": 1899}', 'https://placehold.co/300x400?text=Armor+Upgrade&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-17', '{"en": "Weapon Scope Bundle", "zh": "武器瞄准镜包"}', '{"en": "3 advanced scopes: 4x, 8x, and 12x magnification for all weapon types.", "zh": "3个高级瞄准镜：4倍、8倍和12倍放大，适用于所有武器类型。"}', '{"usd": 1599}', 'https://placehold.co/300x400?text=Scope+Bundle&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-18', '{"en": "Stealth Module", "zh": "隐身模块"}', '{"en": "Active camouflage system. Become invisible for 5 seconds. 3 uses per match.", "zh": "主动伪装系统。可隐身5秒。每场比赛3次使用。"}', '{"usd": 2299}', 'https://placehold.co/300x400?text=Stealth+Module&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-19', '{"en": "Medic Kit Pro", "zh": "专业医疗包"}', '{"en": "Advanced healing kit with instant revive capability and health regeneration.", "zh": "高级医疗包，具有即时复活能力和生命值再生。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Medic+Kit&font=cyber', 'game-2', NOW(), NOW()),

('sku-2-20', '{"en": "Elite Squad Bundle", "zh": "精英小队包"}', '{"en": "4-player squad bundle with matching skins and exclusive squad leader bonuses.", "zh": "4人小队包，包含匹配皮肤和专属队长奖励。"}', '{"usd": 8999}', 'https://placehold.co/300x400?text=Squad+Bundle&font=cyber', 'game-2', NOW(), NOW());

-- Empire Builder Pro SKUs (Strategy Game) - Will continue with remaining games
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Resource Packs
('sku-3-1', '{"en": "Resource Pack Small", "zh": "小型资源包"}', '{"en": "Instant boost: 500 gold, 250 wood, 150 stone, 100 food.", "zh": "即时提升：500金币、250木材、150石头、100食物。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Small+Resources&font=serif', 'game-3', NOW(), NOW()),

('sku-3-2', '{"en": "Resource Pack Medium", "zh": "中型资源包"}', '{"en": "Instant boost of resources: 1000 gold, 500 wood, 300 stone, 200 food.", "zh": "资源即时提升：1000金币、500木材、300石头、200食物。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Resources&font=serif', 'game-3', NOW(), NOW()),

('sku-3-3', '{"en": "Resource Pack Large", "zh": "大型资源包"}', '{"en": "Massive resource boost: 2500 gold, 1250 wood, 750 stone, 500 food.", "zh": "大量资源提升：2500金币、1250木材、750石头、500食物。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Large+Resources&font=serif', 'game-3', NOW(), NOW()),

('sku-3-4', '{"en": "Resource Pack XL", "zh": "资源包XL"}', '{"en": "Massive resource boost: 5000 gold, 2500 wood, 1500 stone, 1000 food.", "zh": "大量资源提升：5000金币、2500木材、1500石头、1000食物。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Resource+Pack+XL&font=serif', 'game-3', NOW(), NOW()),

('sku-3-5', '{"en": "Ultimate Resource Package", "zh": "终极资源包"}', '{"en": "Unlimited resources for 24 hours. Build without limits!", "zh": "24小时无限资源。无限制建造！"}', '{"usd": 14999}', 'https://placehold.co/300x400?text=Ultimate+Resources&font=serif', 'game-3', NOW(), NOW()),

-- Technology & Research
('sku-3-6', '{"en": "Basic Technology Pack", "zh": "基础技术包"}', '{"en": "Skip research time for 3 basic technologies instantly.", "zh": "立即跳过3个基础技术的研究时间。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Basic+Tech&font=serif', 'game-3', NOW(), NOW()),

('sku-3-7', '{"en": "Advanced Technology Pack", "zh": "高级技术包"}', '{"en": "Skip research time and unlock 5 random advanced technologies instantly.", "zh": "跳过研究时间并立即解锁5个随机高级技术。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Tech+Pack&font=serif', 'game-3', NOW(), NOW()),

('sku-3-8', '{"en": "Premium DLC: Ancient Civilizations", "zh": "高级DLC：古代文明"}', '{"en": "Add new ancient civilizations to play with unique units and buildings.", "zh": "添加新的古代文明供游玩，具有独特的单位和建筑。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Ancient+Civs&font=serif', 'game-3', NOW(), NOW()),

('sku-3-9', '{"en": "Military Expansion Pack", "zh": "军事扩张包"}', '{"en": "5 unique military units and 3 defensive buildings.", "zh": "5个独特的军事单位和3个防御建筑。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Military+Pack&font=serif', 'game-3', NOW(), NOW()),

('sku-3-10', '{"en": "Economic Boost Pack", "zh": "经济加成包"}', '{"en": "+25% resource generation for 7 days. Stackable with other boosts.", "zh": "7天内+25%资源生成。可与其他加成叠加。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Economic+Boost&font=serif', 'game-3', NOW(), NOW()),

-- Buildings & Constructions
('sku-3-11', '{"en": "Instant Construction", "zh": "即时建造"}', '{"en": "Instantly complete construction of one building or upgrade.", "zh": "立即完成一个建筑或升级的建造。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Instant+Build&font=serif', 'game-3', NOW(), NOW()),

('sku-3-12', '{"en": "Wonder Blueprint Pack", "zh": "奇迹蓝图包"}', '{"en": "3 exclusive world wonder blueprints with unique bonuses.", "zh": "3个专属世界奇迹蓝图，具有独特奖励。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Wonder+Blueprints&font=serif', 'game-3', NOW(), NOW()),

('sku-3-13', '{"en": "City Defense System", "zh": "城市防御系统"}', '{"en": "Advanced defense towers and walls with automated targeting.", "zh": "高级防御塔和城墙，带有自动瞄准系统。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Defense+System&font=serif', 'game-3', NOW(), NOW()),

('sku-3-14', '{"en": "Trade Route Expansion", "zh": "贸易路线扩张"}', '{"en": "Establish 3 new lucrative trade routes with +50% caravan capacity.", "zh": "建立3个新的有利可图的贸易路线，+50%商队容量。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Trade+Routes&font=serif', 'game-3', NOW(), NOW()),

('sku-3-15', '{"en": "Cultural Center", "zh": "文化中心"}', '{"en": "Special building providing +20% happiness and +15% science output.", "zh": "特殊建筑，提供+20%幸福度和+15%科学产出。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Cultural+Center&font=serif', 'game-3', NOW(), NOW()),

-- Special Boosts
('sku-3-16', '{"en": "Research Speed x7", "zh": "研究速度 x7天"}', '{"en": "Double research speed for 7 days. Get technologies faster!", "zh": "7天内双倍研究速度。更快获得技术！"}', '{"usd": 1799}', 'https://placehold.co/300x400?text=Research+Boost&font=serif', 'game-3', NOW(), NOW()),

('sku-3-17', '{"en": "Population Growth Pack", "zh": "人口增长包"}', '{"en": "Instant +1000 population and +50% growth rate for 7 days.", "zh": "即时+1000人口和7天内+50%增长率。"}', '{"usd": 2299}', 'https://placehold.co/300x400?text=Population+Pack&font=serif', 'game-3', NOW(), NOW()),

('sku-3-18', '{"en": "Storage Capacity Upgrade", "zh": "存储容量升级"}', '{"en": "Double warehouse and granary storage capacity permanently.", "zh": "永久双倍仓库和粮仓存储容量。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Storage+Upgrade&font=serif', 'game-3', NOW(), NOW()),

('sku-3-19', '{"en": "Diplomatic Favor Bundle", "zh": "外交恩惠包"}', '{"en": "Gain instant favorable relations with 3 AI civilizations.", "zh": "立即获得与3个AI文明的友好关系。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Diplomatic+Favor&font=serif', 'game-3', NOW(), NOW()),

('sku-3-20', '{"en": "Empire Starter Kit", "zh": "帝国启动包"}', '{"en": "Complete beginner bundle: resources, technologies, and exclusive advisor.", "zh": "完整新手包：资源、技术和专属顾问。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Empire+Starter&font=serif', 'game-3', NOW(), NOW());


-- Speed Rivals SKUs (Racing Game)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Nitro & Boosts
('sku-4-1', '{"en": "Nitro Boost x10", "zh": "氮气加速 x10"}', '{"en": "10 nitro boosts for instant speed advantages in races.", "zh": "10次氮气加速，在比赛中获得即时速度优势。"}', '{"usd": 199}', 'https://placehold.co/300x400?text=Nitro+x10&font=racing', 'game-4', NOW(), NOW()),

('sku-4-2', '{"en": "Nitro Boost x50", "zh": "氮气加速 x50"}', '{"en": "50 nitro boosts with unlimited use for 7 days.", "zh": "50次氮气加速，7天内无限使用。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Nitro+x50&font=racing', 'game-4', NOW(), NOW()),

('sku-4-3', '{"en": "Nitro Boost Unlimited x30", "zh": "无限氮气 x30天"}', '{"en": "Unlimited nitro boosts for 30 days. Dominate every race!", "zh": "30天无限氮气加速。主导每场比赛！"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Unlimited+Nitro&font=racing', 'game-4', NOW(), NOW()),

('sku-4-4', '{"en": "Speed Boost Pro", "zh": "专业速度加成"}', '{"en": "+25% top speed and +15% acceleration for all vehicles permanently.", "zh": "所有车辆永久+25%最高速度和+15%加速度。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Speed+Boost+Pro&font=racing', 'game-4', NOW(), NOW()),

('sku-4-5', '{"en": "Turbo Charger Elite", "zh": "精英涡轮增压器"}', '{"en": "Elite turbo system with +40% boost power and instant recharge.", "zh": "精英涡轮系统，+40%加成功率和即时充能。"}', '{"usd": 5999}', 'https://placehold.co/300x400?text=Turbo+Elite&font=racing', 'game-4', NOW(), NOW()),

-- Vehicle Packs
('sku-4-6', '{"en": "Starter Car Pack", "zh": "新手汽车包"}', '{"en": "3 basic cars with balanced stats. Perfect for beginners.", "zh": "3辆基础汽车，属性均衡。非常适合新手。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Starter+Cars&font=racing', 'game-4', NOW(), NOW()),

('sku-4-7', '{"en": "Sports Car Collection", "zh": "跑车合集"}', '{"en": "5 high-performance sports cars with exclusive racing liveries.", "zh": "5辆高性能跑车，带有专属赛车涂装。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Sports+Cars&font=racing', 'game-4', NOW(), NOW()),

('sku-4-8', '{"en": "Car Pack: Exotics", "zh": "汽车包：异国风情"}', '{"en": "Unlock 3 exclusive exotic cars with custom liveries and enhanced stats.", "zh": "解锁3辆专属异国汽车，具有定制涂装和增强属性。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Exotic+Cars&font=racing', 'game-4', NOW(), NOW()),

('sku-4-9', '{"en": "Super Car Elite Pack", "zh": "超跑精英包"}', '{"en": "4 legendary supercars with max stats and unique abilities.", "zh": "4辆传奇级超跑，满属性和独特能力。"}', '{"usd": 8999}', 'https://placehold.co/300x400?text=Super+Cars&font=racing', 'game-4', NOW(), NOW()),

('sku-4-10', '{"en": "Vintage Collection", "zh": "复古收藏"}', '{"en": "6 classic vintage cars with nostalgic designs and modern performance.", "zh": "6辆经典复古汽车，怀旧设计和现代性能。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Vintage+Cars&font=racing', 'game-4', NOW(), NOW()),

-- Customization & Cosmetics
('sku-4-11', '{"en": "Premium Currency Pack", "zh": "高级货币包"}', '{"en": "5000 in-game currency for cosmetics and upgrades.", "zh": "5000个游戏内货币，用于装饰品和升级。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Premium+Currency&font=racing', 'game-4', NOW(), NOW()),

('sku-4-12', '{"en": "Custom Paint Job Bundle", "zh": "定制涂装包"}', '{"en": "20 exclusive paint colors and 5 custom graphic designs.", "zh": "20种专属颜色和5个自定义图形设计。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Custom+Paint&font=racing', 'game-4', NOW(), NOW()),

('sku-4-13', '{"en": "Neon Underglow Kit", "zh": "霓虹底盘灯包"}', '{"en": "RGB neon underglow system with 50 color combinations and sync modes.", "zh": "RGB霓虹底盘灯系统，50种颜色组合和同步模式。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Neon+Underglow&font=racing', 'game-4', NOW(), NOW()),

('sku-4-14', '{"en": "Wheel & Rim Collection", "zh": "轮毂合集"}', '{"en": "15 premium wheel designs including spinners and chrome finishes.", "zh": "15个高级轮毂设计，包括旋转器和镀铬饰面。"}', '{"usd": 1899}', 'https://placehold.co/300x400?text=Wheel+Collection&font=racing', 'game-4', NOW(), NOW()),

('sku-4-15', '{"en": "Body Kit Pro", "zh": "专业车身套件"}', '{"en": "Aerodynamic body kits for all car types with performance bonuses.", "zh": "适用于所有车型的空气动力学车身套件，带有性能奖励。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Body+Kit&font=racing', 'game-4', NOW(), NOW()),

-- Racing Pass & Events
('sku-4-16', '{"en": "Season Pass Premium", "zh": "季票高级版"}', '{"en": "Premium season pass with exclusive rewards and bonus XP.", "zh": "高级季票，包含独家奖励和经验值加成。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Season+Pass&font=racing', 'game-4', NOW(), NOW()),

('sku-4-17', '{"en": "Racing Legend Pack", "zh": "赛车传奇包"}', '{"en": "Access to exclusive racing events and legendary driver gear.", "zh": "参与专属赛车活动和传奇驾驶装备。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Racing+Legend&font=racing', 'game-4', NOW(), NOW()),

('sku-4-18', '{"en": "Track Master Bundle", "zh": "赛道大师包"}', '{"en": "Unlock 5 exclusive tracks and permanent track creator access.", "zh": "解锁5个专属赛道和永久赛道创作者权限。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Track+Master&font=racing', 'game-4', NOW(), NOW()),

('sku-4-19', '{"en": "Garage Expansion", "zh": "车库扩展"}', '{"en": "Add 50 extra parking slots to your garage. Store all your cars!", "zh": "为你的车库增加50个额外停车位。存放所有汽车！"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Garage+Expand&font=racing', 'game-4', NOW(), NOW()),

('sku-4-20', '{"en": "Elite Driver Bundle", "zh": "精英驾驶员包"}', '{"en": "Complete starter bundle: premium car, boosts, customizations, and VIP status.", "zh": "完整新手包：高级汽车、加成、定制和VIP身份。"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Elite+Driver&font=racing', 'game-4', NOW(), NOW()),

-- Last Survival SKUs (Battle Royale)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Supply Drops & Equipment
('sku-5-1', '{"en": "Basic Supply Drop", "zh": "基础补给空投"}', '{"en": "Get airdropped supplies with basic weapons, armor, and healing items.", "zh": "获得空投补给，包含基础武器、护甲和治疗物品。"}', '{"usd": 199}', 'https://placehold.co/300x400?text=Basic+Supply&font=military', 'game-5', NOW(), NOW()),

('sku-5-2', '{"en": "Supply Drop Bundle", "zh": "补给空投包"}', '{"en": "3 premium supply drops with guaranteed rare items.", "zh": "3个高级补给空投，保证稀有物品。"}', '{"usd": 599}', 'https://placehold.co/300x400?text=Supply+Bundle&font=military', 'game-5', NOW(), NOW()),

('sku-5-3', '{"en": "Elite Supply Crate", "zh": "精英补给箱"}', '{"en": "5 supply crates with epic or legendary items guaranteed.", "zh": "5个补给箱，保证史诗级或传说级物品。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Elite+Supply&font=military', 'game-5', NOW(), NOW()),

('sku-5-4', '{"en": "Battle Coin Pack x500", "zh": "战斗硬币包 x500"}', '{"en": "500 battle coins for basic equipment and consumables.", "zh": "500个战斗硬币，用于基础装备和消耗品。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Battle+Coins+500&font=military', 'game-5', NOW(), NOW()),

('sku-5-5', '{"en": "Battle Coin Pack x1000", "zh": "战斗硬币包 x1000"}', '{"en": "1000 battle coins for purchasing exclusive weapons and equipment.", "zh": "1000个战斗硬币，用于购买专属武器和装备。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Battle+Coins&font=military', 'game-5', NOW(), NOW()),

('sku-5-6', '{"en": "Battle Coin Pack x2500", "zh": "战斗硬币包 x2500"}', '{"en": "2500 battle coins with 10% bonus. Ultimate equipment access.", "zh": "2500个战斗硬币，10%奖励。终极装备访问权限。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Battle+Coins+2500&font=military', 'game-5', NOW(), NOW()),

-- Weapon Collections
('sku-5-7', '{"en": "Assault Rifle Bundle", "zh": "突击步枪包"}', '{"en": "3 premium assault rifles with extended magazines and scopes.", "zh": "3把高级突击步枪，带有扩展弹匣和瞄准镜。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Rifle+Bundle&font=military', 'game-5', NOW(), NOW()),

('sku-5-8', '{"en": "Sniper Elite Pack", "zh": "狙击精英包"}', '{"en": "2 legendary sniper rifles with thermal optics and one-shot capabilities.", "zh": "2把传说级狙击步枪，带有热成像光学和一击必杀能力。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Sniper+Elite&font=military', 'game-5', NOW(), NOW()),

('sku-5-9', '{"en": "SMG Close Combat Set", "zh": "冲锋枪近战套装"}', '{"en": "4 high-rate SMGs perfect for close quarters battle.", "zh": "4把高射速冲锋枪，完美适用于近距离战斗。"}', '{"usd": 1599}', 'https://placehold.co/300x400?text=SMG+Set&font=military', 'game-5', NOW(), NOW()),

('sku-5-10', '{"en": "Elite Weapon Pack", "zh": "精英武器包"}', '{"en": "Guaranteed rare or legendary weapon in every pack. Best value!", "zh": "每包都保证稀有或传说级武器。超值！"}', '{"usd": 4999}', 'https://placehold.co/300x400?text=Elite+Weapons&font=military', 'game-5', NOW(), NOW()),

('sku-5-11', '{"en": "Melee Master Collection", "zh": "近战大师合集"}', '{"en": "5 unique melee weapons including tactical knives and katanas.", "zh": "5把独特的近战武器，包括战术刀和武士刀。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Melee+Master&font=military', 'game-5', NOW(), NOW()),

-- Special Items & Abilities
('sku-5-12', '{"en": "Victory Royale Pass", "zh": "胜利大逃杀通行证"}', '{"en": "Unlock exclusive victory cosmetics and celebration emotes.", "zh": "解锁专属胜利装饰品和庆祝表情。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Victory+Pass&font=military', 'game-5', NOW(), NOW()),

('sku-5-13', '{"en": "Parachute Pro Pack", "zh": "专业降落伞包"}', '{"en": "Advanced parachute system with precision landing and reduced fall damage.", "zh": "高级降落伞系统，精准降落和减少坠落伤害。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Parachute+Pro&font=military', 'game-5', NOW(), NOW()),

('sku-5-14', '{"en": "Medic Kit Elite", "zh": "精英医疗包"}', '{"en": "Advanced medical supplies with instant revive and health regeneration.", "zh": "高级医疗用品，即时复活和生命值再生。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Medic+Elite&font=military', 'game-5', NOW(), NOW()),

('sku-5-15', '{"en": "Armor Plating Pro", "zh": "专业装甲板"}', '{"en": "Tactical armor plating with +30% damage resistance.", "zh": "战术装甲板，+30%伤害抗性。"}', '{"usd": 1899}', 'https://placehold.co/300x400?text=Armor+Pro&font=military', 'game-5', NOW(), NOW()),

('sku-5-16', '{"en": "Stealth Camo System", "zh": "隐身迷彩系统"}', '{"en": "Active camouflage for 10 seconds. 3 uses per match.", "zh": "主动迷彩10秒。每场比赛3次使用。"}', '{"usd": 2299}', 'https://placehold.co/300x400?text=Stealth+Camo&font=military', 'game-5', NOW(), NOW()),

('sku-5-17', '{"en": "Communication Jammer", "zh": "通信干扰器"}', '{"en": "Jam enemy minimap and communication for 30 seconds.", "zh": "干扰敌方小地图和通信30秒。"}', '{"usd': 1499}', 'https://placehold.co/300x400?text=Comm+Jammer&font=military', 'game-5', NOW(), NOW()),

('sku-5-18', '{"en": "Tactical Drone", "zh": "战术无人机"}', '{"en": "Scout drone with 60-second flight time and enemy marking.", "zh": "侦察无人机，60秒飞行时间和敌人标记。"}', '{"usd': 2799}', 'https://placehold.co/300x400?text=Tactical+Drone&font=military', 'game-5', NOW(), NOW()),

('sku-5-19', '{"en": "Survivalist Bundle", "zh": "生存专家包"}', '{"en": "Complete survival kit: armor, weapons, healing, and utility items.", "zh": "完整生存包：护甲、武器、治疗和工具物品。"}', '{"usd": 3499}', 'https://placehold.co/300x400?text=Survivalist+Bundle&font=military', 'game-5', NOW(), NOW()),

('sku-5-20', '{"en": "Battle Royale Champion Pack", "zh": "大逃杀冠军包"}', '{"en": "Ultimate bundle: legendary weapons, elite armor, and champion status.", "zh": "终极包：传说武器、精英护甲和冠军身份。"}', '{"usd": 9999}', 'https://placehold.co/300x400?text=Champion+Pack&font=military', 'game-5', NOW(), NOW()),

-- Mystic Gardens SKUs (Puzzle Adventure)
INSERT INTO skus (id, name, description, prices, image_url, game_id, created_at, updated_at) VALUES
-- Hints & Help
('sku-6-1', '{"en": "Hint Pack x3", "zh": "提示包 x3"}', '{"en": "3 hints to help you solve challenging puzzles.", "zh": "3个提示来帮助你解决具挑战性的谜题。"}', '{"usd": 199}', 'https://placehold.co/300x400?text=Hints+x3&font=floral', 'game-6', NOW(), NOW()),

('sku-6-2', '{"en": "Hint Pack x5", "zh": "提示包 x5"}', '{"en": "5 hints to help you solve the most challenging puzzles.", "zh": "5个提示来帮助你解决最具挑战性的谜题。"}', '{"usd": 299}', 'https://placehold.co/300x400?text=Hints+x5&font=floral', 'game-6', NOW(), NOW()),

('sku-6-3', '{"en": "Hint Pack x15", "zh": "提示包 x15"}', '{"en": "15 premium hints with puzzle-solving strategies included.", "zh": "15个高级提示，包含解谜策略。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Hints+x15&font=floral', 'game-6', NOW(), NOW()),

('sku-6-4', '{"en": "Hint Pack Unlimited x7", "zh": "无限提示 x7天"}', '{"en": "Unlimited hints for 7 days. Never get stuck on a puzzle!", "zh": "7天无限提示。再也不会被谜题卡住！"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Unlimited+Hints&font=floral', 'game-6', NOW(), NOW()),

('sku-6-5', '{"en": "Puzzle Master Guide", "zh": "解谜大师指南"}', '{"en": "Complete puzzle-solving guide with all solutions and tips.", "zh": "完整解谜指南，包含所有解决方案和技巧。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Puzzle+Guide&font=floral', 'game-6', NOW(), NOW()),

-- Garden Access & Content
('sku-6-6', '{"en": "Garden Unlock Pack", "zh": "花园解锁包"}', '{"en": "Unlock 3 new mystical gardens with unique themes.", "zh": "解锁3个新的神秘花园，具有独特主题。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Garden+Unlock&font=floral', 'game-6', NOW(), NOW()),

('sku-6-7', '{"en": "Unlock All Gardens", "zh": "解锁所有花园"}', '{"en": "Instant access to all current and future gardens.", "zh": "立即访问所有当前和未来的花园。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=All+Gardens&font=floral', 'game-6', NOW(), NOW()),

('sku-6-8', '{"en": "Premium Garden Collection", "zh": "高级花园合集"}', '{"en": "10 exclusive gardens with rare puzzles and treasures.", "zh": "10个专属花园，包含稀有谜题和宝藏。"}', '{"usd": 3999}', 'https://placehold.co/300x400?text=Premium+Gardens&font=floral', 'game-6', NOW(), NOW()),

('sku-6-9', '{"en": "Seasonal Garden Bundle", "zh": "季节花园包"}', '{"en": "Access to seasonal gardens with holiday-themed puzzles.", "zh": "访问季节性花园，包含节日主题谜题。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Seasonal+Gardens&font=floral', 'game-6', NOW(), NOW()),

('sku-6-10', '{"en": "Mystic Garden Expansion", "zh": "神秘花园扩张"}', '{"en": "20 new garden levels with magical creatures and elements.", "zh": "20个新花园关卡，包含魔法生物和元素。"}', '{"usd": 2999}', 'https://placehold.co/300x400?text=Garden+Expansion&font=floral', 'game-6', NOW(), NOW()),

-- Power-ups & Tools
('sku-6-11', '{"en": "Power-Up Bundle", "zh": "强化包"}', '{"en": "Collection of useful power-ups: time freeze, unlimited moves, and auto-solve.", "zh": "有用的强化道具集合：时间冻结、无限移动和自动解决。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Power+Ups&font=floral', 'game-6', NOW(), NOW()),

('sku-6-12', '{"en": "Time Freeze x10", "zh": "时间冻结 x10"}', '{"en": "10 time freeze power-ups to pause puzzle timers.", "zh": "10个时间冻结道具，可暂停谜题计时器。"}', '{"usd": 499}', 'https://placehold.co/300x400?text=Time+Freeze&font=floral', 'game-6', NOW(), NOW()),

('sku-6-13', '{"en": "Shuffle Master Pack", "zh": "洗牌大师包"}', '{"en": "5 puzzle shuffle power-ups to rearrange challenging layouts.", "zh": "5个谜题洗牌道具，可重新排列具有挑战性的布局。"}', '{"usd": 799}', 'https://placehold.co/300x400?text=Shuffle+Master&font=floral', 'game-6', NOW(), NOW()),

('sku-6-14', '{"en": "Bomb Removal Kit", "zh": "炸弹移除包"}', '{"en": "Remove obstacles and blocked tiles from any puzzle.", "zh": "从任何谜题中移除障碍物和被阻挡的瓷砖。"}', '{"usd": 1299}', 'https://placehold.co/300x400?text=Bomb+Removal&font=floral', 'game-6', NOW(), NOW()),

('sku-6-15', '{"en": "Magic Wand Collection", "zh": "魔法棒合集"}', '{"en": "Set of magical tools to solve impossible puzzles instantly.", "zh": "一套魔法工具，可立即解决不可能的谜题。"}', '{"usd": 2499}', 'https://placehold.co/300x400?text=Magic+Wand&font=floral', 'game-6', NOW(), NOW()),

-- Cosmetics & Customization
('sku-6-16', '{"en": "Garden Decoration Pack", "zh": "花园装饰包"}', '{"en": "50 decorative items to customize your garden spaces.", "zh": "50个装饰物品，用于定制你的花园空间。"}', '{"usd": 1499}', 'https://placehold.co/300x400?text=Garden+Decor&font=floral', 'game-6', NOW(), NOW()),

('sku-6-17', '{"en": "Avatar Bundle Zen", "zh": "禅意头像包"}', '{"en": "10 peaceful avatar outfits and accessories.", "zh": "10套宁静头像服装和配饰。"}', '{"usd": 899}', 'https://placehold.co/300x400?text=Zen+Avatar&font=floral', 'game-6', NOW(), NOW()),

('sku-6-18', '{"en": "Premium Frames Collection", "zh": "高级相框合集"}', '{"en": "20 beautiful frames for your completed puzzle screenshots.", "zh": "20个精美相框，用于你完成的谜题截图。"}', '{"usd': 1299}', 'https://placehold.co/300x400?text=Premium+Frames&font=floral', 'game-6', NOW(), NOW()),

('sku-6-19', '{"en": "Music Box Serenity", "zh": "宁静音乐盒"}', '{"en": "Unlock 20 calming background tracks for puzzle-solving.", "zh": "解锁20首宁静的背景音乐，用于解谜。"}', '{"usd": 1999}', 'https://placehold.co/300x400?text=Serenity+Music&font=floral', 'game-6', NOW(), NOW()),

('sku-6-20', '{"en": "Premium Membership", "zh": "高级会员"}', '{"en": "Unlimited access to all premium features and exclusive content.", "zh": "无限制访问所有高级功能和独家内容。"}', '{"usd": 999}', 'https://placehold.co/300x400?text=Premium+Membership&font=floral', 'game-6', NOW(), NOW());

-- Sample Orders
INSERT INTO orders (id, user_id, sku_id, merchant_id, amount, currency, status, created_at, updated_at) VALUES
('order-1', 'profile-user-1', 'sku-1-4', 'profile-merchant-1', 4999, 'usd', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('order-2', 'profile-user-2', 'sku-2-1', 'profile-merchant-1', 1499, 'usd', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('order-3', 'profile-user-1', 'sku-3-1', 'profile-merchant-2', 999, 'usd', 'pending', NOW(), NOW()),
('order-4', 'profile-user-2', 'sku-4-2', 'profile-merchant-2', 999, 'usd', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('order-5', 'profile-user-1', 'sku-5-3', 'profile-merchant-1', 999, 'usd', 'failed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('order-6', 'profile-user-2', 'sku-6-1', 'profile-merchant-2', 199, 'usd', 'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('order-7', 'profile-user-1', 'sku-1-10', 'profile-merchant-1', 799, 'usd', 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('order-8', 'profile-user-2', 'sku-2-8', 'profile-merchant-1', 2499, 'usd', 'completed', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('order-9', 'profile-user-1', 'sku-3-5', 'profile-merchant-2', 14999, 'usd', 'completed', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
('order-10', 'profile-user-2', 'sku-4-10', 'profile-merchant-2', 2999, 'usd', 'pending', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('order-11', 'profile-user-1', 'sku-5-10', 'profile-merchant-1', 4999, 'usd', 'completed', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'),
('order-12', 'profile-user-2', 'sku-6-7', 'profile-merchant-2', 1999, 'usd', 'completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('order-13', 'profile-user-1', 'sku-1-11', 'profile-merchant-1', 14999, 'usd', 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('order-14', 'profile-user-2', 'sku-2-20', 'profile-merchant-1', 8999, 'usd', 'failed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('order-15', 'profile-user-1', 'sku-3-12', 'profile-merchant-2', 3999, 'usd', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('order-16', 'profile-user-2', 'sku-4-4', 'profile-merchant-2', 8999, 'usd', 'completed', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
('order-17', 'profile-user-1', 'sku-5-20', 'profile-merchant-1', 9999, 'usd', 'pending', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),
('order-18', 'profile-user-2', 'sku-6-20', 'profile-merchant-2', 999, 'usd', 'completed', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('order-19', 'profile-user-1', 'sku-1-20', 'profile-merchant-1', 3999, 'usd', 'completed', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('order-20', 'profile-user-2', 'sku-2-12', 'profile-merchant-1', 4999, 'usd', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');