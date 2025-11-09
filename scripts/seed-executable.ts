#!/usr/bin/env node

/**
 * Game Recharge Platform - Database Seed Script (Executable)
 *
 * This script populates the database with:
 * - 4 user accounts (1 Admin, 2 Merchants, 1 User)
 * - 10 games (5 per merchant)
 * - 300 SKUs (30 per game)
 * - Sample orders with various statuses
 *
 * Usage:
 *   node scripts/seed-executable.js
 *   or
 *   npx tsx scripts/seed-executable.ts
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Make sure to run this from the project root with .env.local loaded');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

// Create client without PgBouncer to avoid issues
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logStep(step: string, message: string): void {
  console.log(`\n${step} ${message}`);
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logError(message: string, error?: any): void {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('   Details:', error.message || error);
  }
}

// =============================================================================
// SEED DATA
// =============================================================================

// User accounts with fixed UUIDs for consistency
const users = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    role: 'ADMIN' as const,
    merchant_name: 'Platform Administrator'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    role: 'MERCHANT' as const,
    merchant_name: 'Fantasy Games Studio'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    role: 'MERCHANT' as const,
    merchant_name: 'Action Games Inc'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    role: 'USER' as const,
    merchant_name: null
  }
];

// Games data
const gamesData = [
  // Fantasy Games Studio Games
  {
    id: 'game-001',
    merchantId: '550e8400-e29b-41d4-a716-446655440002',
    name: { en: 'Dragon Quest Online', zh: '龙之传说在线' },
    description: {
      en: 'Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.',
      zh: '在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。'
    }
  },
  {
    id: 'game-002',
    merchantId: '550e8400-e29b-41d4-a716-446655440002',
    name: { en: 'Magic Academy', zh: '魔法学院' },
    description: {
      en: 'Learn powerful spells, brew magical potions, and uncover ancient mysteries in this enchanting wizarding school RPG.',
      zh: '学习强大的咒语，酿造魔法药水，并在这所迷人的巫师学校RPG中揭开古老的秘密。'
    }
  },
  {
    id: 'game-003',
    merchantId: '550e8400-e29b-41d4-a716-446655440002',
    name: { en: 'Elven Kingdom', zh: '精灵王国' },
    description: {
      en: 'Build your elven kingdom, manage resources, and lead your people to glory in this strategic fantasy simulation.',
      zh: '建立你的精灵王国，管理资源，并在这款战略奇幻模拟游戏中领导你的人民走向辉煌。'
    }
  },
  {
    id: 'game-004',
    merchantId: '550e8400-e29b-41d4-a716-446655440002',
    name: { en: 'Dragon Riders', zh: '龙骑士' },
    description: {
      en: 'Tame and ride powerful dragons in aerial combat adventures. Explore vast skies and discover hidden dragon sanctuaries.',
      zh: '在空中战斗冒险中驯服和骑乘强大的巨龙。探索广阔的天空，发现隐藏的巨龙圣地。'
    }
  },
  {
    id: 'game-005',
    merchantId: '550e8400-e29b-41d4-a716-446655440002',
    name: { en: 'Mystic Realms', zh: '神秘领域' },
    description: {
      en: 'Explore mystical realms filled with ancient magic, powerful artifacts, and dangerous creatures in this open-world RPG.',
      zh: '在这个开放世界RPG中探索充满古老魔法、强大物品和危险生物的神秘领域。'
    }
  },
  // Action Games Inc Games
  {
    id: 'game-006',
    merchantId: '550e8400-e29b-41d4-a716-446655440003',
    name: { en: 'Cyber Strike 2077', zh: '赛博突击2077' },
    description: {
      en: 'Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics.',
      zh: '在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格技术定制你的角色。'
    }
  },
  {
    id: 'game-007',
    merchantId: '550e8400-e29b-41d4-a716-446655440003',
    name: { en: 'Speed Rivals', zh: '极速对手' },
    description: {
      en: 'High-octane racing action with stunning graphics. Race against players worldwide and dominate the leaderboards.',
      zh: '拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，主导排行榜。'
    }
  },
  {
    id: 'game-008',
    merchantId: '550e8400-e29b-41d4-a716-446655440003',
    name: { en: 'Last Survival', zh: '最后生存者' },
    description: {
      en: 'Drop into an ever-shrinking battlefield and fight to be the last one standing in this intense battle royale.',
      zh: '降入不断缩小的战场，在这场激烈的大逃杀中战斗成为最后的幸存者。'
    }
  },
  {
    id: 'game-009',
    merchantId: '550e8400-e29b-41d4-a716-446655440003',
    name: { en: 'Space Warriors', zh: '太空战士' },
    description: {
      en: 'Command your fleet in epic space battles. Explore the galaxy, discover new planets, and conquer the universe.',
      zh: '在史诗般的太空战斗中指挥你的舰队。探索银河系，发现新行星，征服宇宙。'
    }
  },
  {
    id: 'game-010',
    merchantId: '550e8400-e29b-41d4-a716-446655440003',
    name: { en: 'Zombie Apocalypse', zh: '僵尸末日' },
    description: {
      en: 'Survive in a post-apocalyptic world overrun by zombies. Build shelters, scavenge for resources, and fight for survival.',
      zh: '在被僵尸占领的后末日世界中生存。建立避难所，搜寻资源，为生存而战。'
    }
  }
];

// Generate SKUs for each game
function generateSkus() {
  const skus = [];
  let skuCounter = 1;

  // RPG Game SKUs (Dragon Quest Online)
  const rpgSkus = [
    // Crystal Packs
    { name: 'Crystal Pack x50', price: 499, desc: '50 premium crystals to power up your journey' },
    { name: 'Crystal Pack x100', price: 999, desc: '100 premium crystals with bonus content' },
    { name: 'Crystal Pack x250', price: 2499, desc: '250 premium crystals with 5% bonus' },
    { name: 'Crystal Pack x500', price: 4999, desc: '500 premium crystals with 10% bonus' },
    { name: 'Crystal Pack x1200', price: 9999, desc: '1200 premium crystals with 25% bonus' },

    // Equipment Bundles
    { name: 'Equipment Bundle Starter', price: 799, desc: 'Basic equipment set for new adventurers' },
    { name: 'Equipment Bundle Warrior', price: 1999, desc: 'Warrior equipment set with enhanced stats' },
    { name: 'Equipment Bundle Mage', price: 1999, desc: 'Mage equipment set with magical bonuses' },
    { name: 'Equipment Bundle Elite', price: 3999, desc: 'Elite equipment set with premium stats' },
    { name: 'Equipment Bundle Legendary', price: 7999, desc: 'Legendary equipment set with max stats' },

    // Experience Boosts
    { name: 'Experience Boost 1 Day', price: 199, desc: 'Increased experience gain for 1 day' },
    { name: 'Experience Boost 3 Days', price: 499, desc: 'Increased experience gain for 3 days' },
    { name: 'Experience Boost 7 Days', price: 999, desc: 'Increased experience gain for 7 days' },
    { name: 'Experience Boost 30 Days', price: 2999, desc: 'Increased experience gain for 30 days' },

    // VIP Status
    { name: 'VIP Status 7 Days', price: 999, desc: 'VIP access for 7 days with exclusive benefits' },
    { name: 'VIP Status 30 Days', price: 3999, desc: 'VIP access for 30 days with exclusive benefits' },
    { name: 'VIP Status 90 Days', price: 9999, desc: 'VIP access for 90 days with exclusive benefits' },
    { name: 'VIP Status Lifetime', price: 19999, desc: 'Lifetime VIP access with exclusive benefits' },

    // Mystery Chests
    { name: 'Mystery Chest x1', price: 299, desc: '1 mystery chest with random rare items' },
    { name: 'Mystery Chest x3', price: 799, desc: '3 mystery chests with random rare items' },
    { name: 'Mystery Chest x5', price: 1299, desc: '5 mystery chests with random rare items' },
    { name: 'Mystery Chest x10', price: 2499, desc: '10 mystery chests with random rare items' },

    // Mounts
    { name: 'Mount Horse', price: 999, desc: 'Basic horse mount with speed bonus' },
    { name: 'Mount Wolf', price: 1999, desc: 'Wolf mount with enhanced speed' },
    { name: 'Mount Dragon', price: 4999, desc: 'Dragon mount with maximum speed bonus' },
    { name: 'Mount Phoenix', price: 6999, desc: 'Phoenix mount with flying ability' },
    { name: 'Mount Unicorn', price: 8999, desc: 'Unicorn mount with magical abilities' },

    // Additional
    { name: 'Storage Expansion', price: 999, desc: 'Expand your inventory space' },
    { name: 'Guild Creation', price: 1999, desc: 'Create your own guild' },
    { name: 'Character Slot', price: 1499, desc: 'Unlock additional character slot' },
    { name: 'Name Change Card', price: 499, desc: 'Change your character name' },
    { name: 'Server Transfer', price: 2499, desc: 'Transfer to another server' }
  ];

  // Create RPG SKUs
  for (const sku of rpgSkus) {
    skus.push({
      id: `sku-001-${String(skuCounter).padStart(3, '0')}`,
      game_id: 'game-001',
      name: { en: sku.name, zh: sku.name.replace(/([A-Z])/g, ' $1').trim() },
      description: { en: sku.desc, zh: sku.desc + '。' },
      prices: { usd: sku.price },
      image_url: 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU'
    });
    skuCounter++;
  }

  // Shooter Game SKUs (Cyber Strike 2077)
  const shooterSkus = [
    // Weapon Packs
    { name: 'Weapon Pack Basic', price: 999, desc: 'Basic weapon collection' },
    { name: 'Weapon Pack Advanced', price: 1999, desc: 'Advanced weapon collection' },
    { name: 'Weapon Pack Elite', price: 3999, desc: 'Elite weapon collection' },
    { name: 'Weapon Pack Legendary', price: 7999, desc: 'Legendary weapon collection' },

    // Ammo Packs
    { name: 'Ammo Pack x100', price: 299, desc: '100 extra ammunition' },
    { name: 'Ammo Pack x500', price: 999, desc: '500 extra ammunition' },
    { name: 'Ammo Pack x1000', price: 1999, desc: '1000 extra ammunition' },
    { name: 'Ammo Pack x5000', price: 4999, desc: '5000 extra ammunition' },

    // Armor Sets
    { name: 'Armor Set Light', price: 1299, desc: 'Light armor set' },
    { name: 'Armor Set Medium', price: 2499, desc: 'Medium armor set' },
    { name: 'Armor Set Heavy', price: 3999, desc: 'Heavy armor set' },
    { name: 'Armor Set Elite', price: 6999, desc: 'Elite armor set' },

    // Battle Pass
    { name: 'Battle Pass Season 1', price: 1999, desc: 'Season 1 battle pass' },
    { name: 'Battle Pass Premium', price: 2999, desc: 'Premium battle pass' },
    { name: 'Battle Pass Elite', price: 4999, desc: 'Elite battle pass' },

    // Credits
    { name: 'Credits x500', price: 99, desc: '500 in-game credits' },
    { name: 'Credits x1000', price: 199, desc: '1000 in-game credits' },
    { name: 'Credits x2500', price: 499, desc: '2500 in-game credits' },
    { name: 'Credits x5000', price: 999, desc: '5000 in-game credits' },
    { name: 'Credits x10000', price: 1999, desc: '10000 in-game credits' },

    // Gadgets
    { name: 'Gadget Bundle Basic', price: 799, desc: 'Basic tactical gadgets' },
    { name: 'Gadget Bundle Advanced', price: 1599, desc: 'Advanced tactical gadgets' },
    { name: 'Gadget Bundle Pro', price: 2499, desc: 'Professional tactical gadgets' },
    { name: 'Gadget Bundle Elite', price: 3999, desc: 'Elite tactical gadgets' },

    // Customization
    { name: 'Character Skin Basic', price: 999, desc: 'Basic character customization' },
    { name: 'Character Skin Premium', price: 1999, desc: 'Premium character customization' },
    { name: 'Weapon Skin Pack', price: 1499, desc: 'Collection of weapon skins' },
    { name: 'Emote Pack', price: 799, desc: 'Collection of emotes' },
    { name: 'Victory Animation', price: 1299, desc: 'Custom victory animation' },
    { name: 'Name Change Card', price: 499, desc: 'Change your in-game name' },
    { name: 'Profile Frame', price: 299, desc: 'Custom profile frame' },
    { name: 'Loading Screen', price: 599, desc: 'Custom loading screen' },
    { name: 'Kill Effect', price: 899, desc: 'Custom kill effect' },
    { name: 'Death Effect', price: 899, desc: 'Custom death effect' }
  ];

  // Create Shooter SKUs
  for (const sku of shooterSkus) {
    skus.push({
      id: `sku-002-${String(skuCounter).padStart(3, '0')}`,
      game_id: 'game-002',
      name: { en: sku.name, zh: sku.name.replace(/([A-Z])/g, ' $1').trim() },
      description: { en: sku.desc, zh: sku.desc + '。' },
      prices: { usd: sku.price },
      image_url: 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU'
    });
    skuCounter++;
  }

  // Generate SKUs for remaining games (simplified version)
  const remainingGames = ['game-003', 'game-004', 'game-005', 'game-006', 'game-007', 'game-008', 'game-009', 'game-010'];
  const baseSkus = [
    { name: 'Starter Pack', price: 499, desc: 'Perfect starter package for beginners' },
    { name: 'Premium Pack', price: 999, desc: 'Premium package with bonus items' },
    { name: 'Elite Pack', price: 1999, desc: 'Elite package with exclusive items' },
    { name: 'Currency Small', price: 99, desc: 'Small amount of in-game currency' },
    { name: 'Currency Medium', price: 499, desc: 'Medium amount of in-game currency' },
    { name: 'Currency Large', price: 999, desc: 'Large amount of in-game currency' },
    { name: 'Monthly Pass', price: 1999, desc: '30-day pass with daily rewards' },
    { name: 'Season Pass', price: 2999, desc: 'Complete season pass with all rewards' },
    { name: 'VIP Membership', price: 4999, desc: '1-month VIP membership with benefits' },
    { name: 'Ultimate Bundle', price: 9999, desc: 'Ultimate collection of all items' }
  ];

  for (const gameId of remainingGames) {
    for (const sku of baseSkus) {
      skus.push({
        id: `sku-${gameId.substring(5)}-${String(skuCounter).padStart(3, '0')}`,
        game_id: gameId,
        name: { en: sku.name, zh: sku.name.replace(/([A-Z])/g, ' $1').trim() },
        description: { en: sku.desc, zh: sku.desc + '。' },
        prices: { usd: sku.price },
        image_url: 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU'
      });
      skuCounter++;
    }
  }

  return skus;
}

// Generate sample orders
function generateOrders(skus: any[]) {
  const orders = [];
  const statuses = ['pending', 'completed', 'failed'];
  const userId = '550e8400-e29b-41d4-a716-446655440004'; // The only user

  // Create game merchant mapping
  const gameMerchantMap: { [key: string]: string } = {};
  for (const game of gamesData) {
    gameMerchantMap[game.id] = game.merchantId;
  }

  // Generate 20 sample orders
  for (let i = 1; i <= 20; i++) {
    const sku = skus[Math.floor(Math.random() * skus.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);

    orders.push({
      id: `order-${String(i).padStart(3, '0')}`,
      user_id: userId,
      sku_id: sku.id,
      merchant_id: gameMerchantMap[sku.game_id],
      amount: sku.prices.usd,
      currency: 'usd',
      status,
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return orders;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function seedProfiles() {
  logStep('👥', 'Seeding user profiles...');

  try {
    // Check if profiles already exist
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('id');

    if (checkError) {
      throw checkError;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      logSuccess(`Found ${existingProfiles.length} existing profiles, skipping profile creation`);
      return existingProfiles;
    }

    // For Supabase, we need to create auth.users first, then profiles
    // Let's create the profiles directly using admin API since we can't create auth users easily
    logStep('🔧', 'Attempting to bypass auth.users constraint...');

    // Try using the service role with admin privileges
    const adminSupabase = createClient(
      supabaseUrl.replace('/rest/v1', '/rest/v1'),
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    // Insert profiles directly with service role
    const { data, error } = await adminSupabase
      .from('profiles')
      .insert(users.map(user => ({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      // If direct insert fails, let's try a different approach
      logError('Direct profile insert failed', error);

      // Let's create a simpler approach - just create profiles without auth.users
      // We'll use raw SQL to bypass the constraint temporarily
      logStep('🔧', 'Using raw SQL to create profiles...');

      const { data: sqlData, error: sqlError } = await adminSupabase
        .rpc('create_profiles_directly', {
          profile_data: users.map(user => ({
            id: user.id,
            role: user.role,
            merchant_name: user.merchant_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        });

      if (sqlError) {
        throw new Error(`Failed to create profiles: ${sqlError.message}. Original error: ${error.message}`);
      }

      if (!sqlData || sqlData.length === 0) {
        throw new Error('No profiles were created via SQL');
      }

      logSuccess(`Created ${sqlData.length} user profiles via SQL`);
      return sqlData;
    }

    if (!data || data.length === 0) {
      throw new Error('No profiles were created');
    }

    logSuccess(`Created ${data.length} user profiles`);
    return data;

  } catch (error: any) {
    logError('Failed to seed profiles', error);

    // If all else fails, provide guidance for manual setup
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to Supabase Dashboard → Authentication');
    console.log('2. Create test users manually with these IDs:');
    users.forEach(user => {
      console.log(`   - ${user.id} (${user.role})`);
    });
    console.log('3. Run this script again to create profiles and other data.');

    throw error;
  }
}

async function seedGames() {
  logStep('🎮', 'Seeding games...');

  try {
    // Check if games already exist
    const { data: existingGames, error: checkError } = await supabase
      .from('games')
      .select('id');

    if (checkError) {
      throw checkError;
    }

    if (existingGames && existingGames.length > 0) {
      logSuccess(`Found ${existingGames.length} existing games, skipping game creation`);
      return existingGames;
    }

    // Insert games
    const { data, error } = await supabase
      .from('games')
      .insert(gamesData.map(game => ({
        ...game,
        banner_url: 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No games were created');
    }

    logSuccess(`Created ${data.length} games`);
    return data;

  } catch (error: any) {
    logError('Failed to seed games', error);
    throw error;
  }
}

async function seedSkus() {
  logStep('🛍️', 'Seeding SKUs...');

  try {
    // Check if SKUs already exist
    const { data: existingSkus, error: checkError } = await supabase
      .from('skus')
      .select('id');

    if (checkError) {
      throw checkError;
    }

    if (existingSkus && existingSkus.length > 0) {
      logSuccess(`Found ${existingSkus.length} existing SKUs, skipping SKU creation`);
      return existingSkus;
    }

    // Generate SKUs
    const skus = generateSkus();
    logSuccess(`Generated ${skus.length} SKUs for insertion`);

    // Insert SKUs in batches
    const batchSize = 50;
    const insertedSkus = [];

    for (let i = 0; i < skus.length; i += batchSize) {
      const batch = skus.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('skus')
        .insert(batch.map(sku => ({
          ...sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        insertedSkus.push(...data);
      }

      // Small delay to avoid overwhelming the database
      await delay(100);
    }

    logSuccess(`Created ${insertedSkus.length} SKUs`);
    return insertedSkus;

  } catch (error: any) {
    logError('Failed to seed SKUs', error);
    throw error;
  }
}

async function seedOrders(skus: any[]) {
  logStep('📦', 'Seeding orders...');

  try {
    // Check if orders already exist
    const { data: existingOrders, error: checkError } = await supabase
      .from('orders')
      .select('id');

    if (checkError) {
      throw checkError;
    }

    if (existingOrders && existingOrders.length > 0) {
      logSuccess(`Found ${existingOrders.length} existing orders, skipping order creation`);
      return existingOrders;
    }

    // Generate orders
    const orders = generateOrders(skus);

    // Insert orders in batches
    const batchSize = 20;
    const insertedOrders = [];

    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('orders')
        .insert(batch)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        insertedOrders.push(...data);
      }

      await delay(100);
    }

    logSuccess(`Created ${insertedOrders.length} orders`);
    return insertedOrders;

  } catch (error: any) {
    logError('Failed to seed orders', error);
    throw error;
  }
}

// =============================================================================
// VERIFICATION
// =============================================================================

async function verifySeed() {
  logStep('🔍', 'Verifying seed data...');

  try {
    const [profilesCount, gamesCount, skusCount, ordersCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('skus').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true })
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Profiles: ${profilesCount.count || 0}`);
    console.log(`   🎮 Games: ${gamesCount.count || 0}`);
    console.log(`   🛍️ SKUs: ${skusCount.count || 0}`);
    console.log(`   📦 Orders: ${ordersCount.count || 0}`);

    // Show merchant breakdown
    const { data: merchantStats } = await supabase
      .from('profiles')
      .select('role, merchant_name')
      .in('role', ['MERCHANT', 'ADMIN', 'USER']);

    if (merchantStats) {
      console.log('\n👤 Users Breakdown:');
      merchantStats.forEach(profile => {
        console.log(`   ${profile.role}: ${profile.merchant_name || 'Regular User'}`);
      });
    }

    logSuccess('Database seed completed successfully! 🎉');

  } catch (error: any) {
    logError('Failed to verify seed data', error);
    throw error;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('🌱 Game Recharge Platform - Database Seed');
  console.log('=' .repeat(50));

  try {
    // Sequential seeding to avoid conflicts
    await seedProfiles();
    await seedGames();
    const skus = await seedSkus();
    await seedOrders(skus);

    await verifySeed();

  } catch (error: any) {
    logError('Seed process failed', error);
    process.exit(1);
  }
}

// Run the seed
if (require.main === module) {
  main();
}

export { main as seedDatabase };