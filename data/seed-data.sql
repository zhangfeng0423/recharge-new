-- Game Recharge Platform Seed Data
-- This file uses actual user IDs from auth.users table

-- First, let's insert games using the existing merchant user
-- The merchant user ID is: 18e81569-e7f1-49bb-af5b-b6acf1d29ad0
-- The user user ID is: a0852af7-5925-4913-a5df-1a44bb8e6a81

-- Games (using existing merchant profile)
INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
-- Fantasy RPG Game
(gen('uuid'), -- Generate a proper UUID
 '{"en": "Dragon Quest Online", "zh": "龙之传说在线"}',
 '{"en": "Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。"}',
 'https://images.unsplash.com/photo-1511512588026-f351c19cf9ce?w=1200&h=680&fit=crop',
 '18e81569-e7f1-49bb-af5b-b6acf1d29ad0', NOW(), NOW()),

-- Action Shooter Game
(gen('uuid'),
 '{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}',
 '{"en": "Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics and engage in tactical battles across neon-lit cityscapes.", "zh": "在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格定制你的角色，在霓虹灯闪耀的城市景观中进行战术战斗。"}',
 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?w=1200&h=680&fit=crop',
 '18e81569-e7f1-49bb-af5b-b6acf1d29ad0', NOW(), NOW()),

-- Strategy Game
(gen('uuid'),
 '{"en": "Empire Builder Pro", "zh": "帝国建造者专业版"}',
 '{"en": "Build your empire from the ground up. Manage resources, conduct diplomacy, research technologies, and lead your civilization to glory in this deep strategy game.", "zh": "从零开始建立你的帝国。管理资源、进行外交、研究技术，并在这款深度策略游戏中领导你的文明走向辉煌。"}',
 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=680&fit=crop',
 '18e81569-e7f1-49bb-af5b-b6acf1d29ad0', NOW(), NOW());

-- Note: We need to use a different approach since we need the actual game IDs for SKUs
-- Let's create a more practical seed script that works with the actual database