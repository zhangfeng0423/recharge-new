#!/usr/bin/env tsx

/**
 * Game Recharge Platform - Database Seed Script
 *
 * This script populates the database with:
 * - 4 user accounts (1 Admin, 2 Merchants, 1 User)
 * - 10 games (5 per merchant)
 * - 300 SKUs (30 per game)
 * - Sample orders with various statuses
 *
 * Usage:
 *   bun run scripts/seed.ts
 *   or
 *   tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/supabase-types';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// =============================================================================
// CONFIGURATION
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use PgBouncer URL for server-side operations
const supabaseUrlWithPool = supabaseUrl.replace('.supabase.co', '.supabase.co/pgbouncer');

const supabase = createClient<Database>(supabaseUrlWithPool, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =============================================================================
// TYPES
// =============================================================================

type Profile = Database['public']['Tables']['profiles']['Row'];
type Game = Database['public']['Tables']['games']['Row'];
type Sku = Database['public']['Tables']['skus']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

interface GameName {
  en: string;
  zh: string;
}

interface GameDescription {
  en: string;
  zh: string;
}

interface SkuName {
  en: string;
  zh: string;
}

interface SkuDescription {
  en: string;
  zh: string;
}

interface SkuPrices {
  usd: number; // Amount in cents
}

// =============================================================================
// SEED DATA
// =============================================================================

// User accounts with different roles
const users: Omit<Profile, 'created_at' | 'updated_at'>[] = [
  {
    id: randomUUID(),
    role: 'ADMIN',
    merchant_name: 'Platform Administrator'
  },
  {
    id: randomUUID(),
    role: 'MERCHANT',
    merchant_name: 'Fantasy Games Studio'
  },
  {
    id: randomUUID(),
    role: 'MERCHANT',
    merchant_name: 'Action Games Inc'
  },
  {
    id: randomUUID(),
    role: 'USER',
    merchant_name: null
  }
];

// Games data (5 games per merchant)
const gamesData: Array<{
  merchantId: string;
  games: Array<{
    name: GameName;
    description: GameDescription;
    category: string;
  }>;
}> = [
  {
    merchantId: users[1].id, // Fantasy Games Studio
    games: [
      {
        name: { en: 'Dragon Quest Online', zh: '龙之传说在线' },
        description: {
          en: 'Embark on an epic adventure in a vast fantasy world. Battle fearsome dragons, forge powerful alliances, and become a legendary hero in this immersive MMORPG.',
          zh: '在广阔的奇幻世界中踏上史诗般的冒险。与凶猛的巨龙战斗，建立强大的联盟，成为这款沉浸式MMORPG中的传奇英雄。'
        },
        category: 'RPG'
      },
      {
        name: { en: 'Magic Academy', zh: '魔法学院' },
        description: {
          en: 'Learn powerful spells, brew magical potions, and uncover ancient mysteries in this enchanting wizarding school RPG.',
          zh: '学习强大的咒语，酿造魔法药水，并在这所迷人的巫师学校RPG中揭开古老的秘密。'
        },
        category: 'RPG'
      },
      {
        name: { en: 'Elven Kingdom', zh: '精灵王国' },
        description: {
          en: 'Build your elven kingdom, manage resources, and lead your people to glory in this strategic fantasy simulation.',
          zh: '建立你的精灵王国，管理资源，并在这款战略奇幻模拟游戏中领导你的人民走向辉煌。'
        },
        category: 'Strategy'
      },
      {
        name: { en: 'Dragon Riders', zh: '龙骑士' },
        description: {
          en: 'Tame and ride powerful dragons in aerial combat adventures. Explore vast skies and discover hidden dragon sanctuaries.',
          zh: '在空中战斗冒险中驯服和骑乘强大的巨龙。探索广阔的天空，发现隐藏的巨龙圣地。'
        },
        category: 'Adventure'
      },
      {
        name: { en: 'Mystic Realms', zh: '神秘领域' },
        description: {
          en: 'Explore mystical realms filled with ancient magic, powerful artifacts, and dangerous creatures in this open-world RPG.',
          zh: '在这个开放世界RPG中探索充满古老魔法、强大物品和危险生物的神秘领域。'
        },
        category: 'RPG'
      }
    ]
  },
  {
    merchantId: users[2].id, // Action Games Inc
    games: [
      {
        name: { en: 'Cyber Strike 2077', zh: '赛博突击2077' },
        description: {
          en: 'Experience intense multiplayer combat in a dystopian cyberpunk future. Customize your character with advanced cybernetics.',
          zh: '在反乌托邦的未来主义赛博朋世界中体验激烈的多玩家战斗。使用先进的赛博格技术定制你的角色。'
        },
        category: 'Shooter'
      },
      {
        name: { en: 'Speed Rivals', zh: '极速对手' },
        description: {
          en: 'High-octane racing action with stunning graphics. Race against players worldwide and dominate the leaderboards.',
          zh: '拥有惊艳画面的高能量赛车动作。与世界各地的玩家比赛，主导排行榜。'
        },
        category: 'Racing'
      },
      {
        name: { en: 'Last Survival', zh: '最后生存者' },
        description: {
          en: 'Drop into an ever-shrinking battlefield and fight to be the last one standing in this intense battle royale.',
          zh: '降入不断缩小的战场，在这场激烈的大逃杀中战斗成为最后的幸存者。'
        },
        category: 'Battle Royale'
      },
      {
        name: { en: 'Space Warriors', zh: '太空战士' },
        description: {
          en: 'Command your fleet in epic space battles. Explore the galaxy, discover new planets, and conquer the universe.',
          zh: '在史诗般的太空战斗中指挥你的舰队。探索银河系，发现新行星，征服宇宙。'
        },
        category: 'Strategy'
      },
      {
        name: { en: 'Zombie Apocalypse', zh: '僵尸末日' },
        description: {
          en: 'Survive in a post-apocalyptic world overrun by zombies. Build shelters, scavenge for resources, and fight for survival.',
          zh: '在被僵尸占领的后末日世界中生存。建立避难所，搜寻资源，为生存而战。'
        },
        category: 'Survival'
      }
    ]
  }
];

// SKU templates for different game categories
const skuTemplates = {
  RPG: [
    {
      nameBase: 'Crystal Pack',
      items: [50, 100, 250, 500, 1200, 2500],
      priceMultiplier: 1,
      descriptionBase: 'Premium crystals to power up your journey'
    },
    {
      nameBase: 'Equipment Bundle',
      items: ['Starter', 'Warrior', 'Mage', 'Elite', 'Legendary'],
      priceMultiplier: 2,
      descriptionBase: 'Complete equipment set with enhanced stats'
    },
    {
      nameBase: 'Experience Boost',
      items: ['1 Day', '3 Days', '7 Days', '30 Days'],
      priceMultiplier: 0.8,
      descriptionBase: 'Increased experience gain for'
    },
    {
      nameBase: 'VIP Status',
      items: ['7 Days', '30 Days', '90 Days', 'Lifetime'],
      priceMultiplier: 3,
      descriptionBase: 'Exclusive VIP access with premium benefits'
    },
    {
      nameBase: 'Mystery Chest',
      items: [1, 3, 5, 10],
      priceMultiplier: 1.5,
      descriptionBase: 'Mystery chest with random rare items'
    },
    {
      nameBase: 'Mount',
      items: ['Horse', 'Wolf', 'Dragon', 'Phoenix', 'Unicorn'],
      priceMultiplier: 2.5,
      descriptionBase: 'Epic mount with speed bonuses'
    }
  ],
  Shooter: [
    {
      nameBase: 'Weapon Pack',
      items: ['Basic', 'Advanced', 'Elite', 'Legendary'],
      priceMultiplier: 1.8,
      descriptionBase: 'Collection of powerful weapons'
    },
    {
      nameBase: 'Ammo Pack',
      items: [100, 500, 1000, 5000],
      priceMultiplier: 0.5,
      descriptionBase: 'Extra ammunition for your weapons'
    },
    {
      nameBase: 'Armor Set',
      items: ['Light', 'Medium', 'Heavy', 'Elite'],
      priceMultiplier: 2,
      descriptionBase: 'Protective armor with damage reduction'
    },
    {
      nameBase: 'Battle Pass',
      items: ['Season 1', 'Season 2', 'Premium', 'Elite'],
      priceMultiplier: 2.5,
      descriptionBase: 'Unlock exclusive rewards and content'
    },
    {
      nameBase: 'Credits',
      items: [500, 1000, 2500, 5000, 10000],
      priceMultiplier: 0.2,
      descriptionBase: 'In-game currency for purchases'
    },
    {
      nameBase: 'Gadget Pack',
      items: ['Basic', 'Advanced', 'Pro', 'Elite'],
      priceMultiplier: 1.5,
      descriptionBase: 'Tactical gadgets for combat advantage'
    }
  ],
  Strategy: [
    {
      nameBase: 'Resource Pack',
      items: ['Small', 'Medium', 'Large', 'Mega', 'Ultimate'],
      priceMultiplier: 1.2,
      descriptionBase: 'Instant resource boost for your kingdom'
    },
    {
      nameBase: 'Building Bundle',
      items: ['Basic', 'Advanced', 'Premium', 'Deluxe'],
      priceMultiplier: 1.8,
      descriptionBase: 'Collection of building blueprints'
    },
    {
      nameBase: 'Technology Pack',
      items: ['Basic', 'Advanced', 'Revolutionary'],
      priceMultiplier: 2.5,
      descriptionBase: 'Skip research time for technologies'
    },
    {
      nameBase: 'Expansion Pack',
      items: ['Territory', 'Resources', 'Military', 'Complete'],
      priceMultiplier: 3,
      descriptionBase: 'Expand your empire with new content'
    },
    {
      nameBase: 'Diplomacy Pack',
      items: ['Basic', 'Advanced', 'Master'],
      priceMultiplier: 1.5,
      descriptionBase: 'Improve relations with other civilizations'
    },
    {
      nameBase: 'Defense System',
      items: ['Basic', 'Advanced', 'Elite', 'Ultimate'],
      priceMultiplier: 2.2,
      descriptionBase: 'Advanced defense structures for your base'
    }
  ],
  Racing: [
    {
      nameBase: 'Car Pack',
      items: ['Starter', 'Sports', 'Super', 'Hyper', 'Elite'],
      priceMultiplier: 2.5,
      descriptionBase: 'Collection of high-performance vehicles'
    },
    {
      nameBase: 'Nitro Boost',
      items: [10, 50, 100, 'Unlimited'],
      priceMultiplier: 0.8,
      descriptionBase: 'Speed boost for racing advantage'
    },
    {
      nameBase: 'Customization',
      items: ['Basic', 'Premium', 'Elite', 'Ultimate'],
      priceMultiplier: 1.5,
      descriptionBase: 'Visual customization options for vehicles'
    },
    {
      nameBase: 'Track Pack',
      items: ['Basic', 'Advanced', 'Professional', 'Complete'],
      priceMultiplier: 2,
      descriptionBase: 'Unlock new racing tracks'
    },
    {
      nameBase: 'Tuning Package',
      items: ['Basic', 'Performance', 'Racing', 'Elite'],
      priceMultiplier: 1.8,
      descriptionBase: 'Performance upgrades for vehicles'
    },
    {
      nameBase: 'Currency',
      items: [1000, 5000, 10000, 50000],
      priceMultiplier: 0.3,
      descriptionBase: 'In-game currency for purchases'
    }
  ],
  BattleRoyale: [
    {
      nameBase: 'Supply Drop',
      items: ['Basic', 'Premium', 'Elite', 'Legendary'],
      priceMultiplier: 1.5,
      descriptionBase: 'Airdropped supplies with valuable items'
    },
    {
      nameBase: 'Weapon Crate',
      items: ['Basic', 'Advanced', 'Elite', 'Ultimate'],
      priceMultiplier: 2,
      descriptionBase: 'Collection of rare weapons'
    },
    {
      nameBase: 'Armor Kit',
      items: ['Light', 'Medium', 'Heavy', 'Elite'],
      priceMultiplier: 1.8,
      descriptionBase: 'Protective armor with damage reduction'
    },
    {
      nameBase: 'Medic Pack',
      items: ['Basic', 'Advanced', 'Elite'],
      priceMultiplier: 1.2,
      descriptionBase: 'Medical supplies for healing'
    },
    {
      nameBase: 'Gadget Bundle',
      items: ['Basic', 'Advanced', 'Elite', 'Pro'],
      priceMultiplier: 1.6,
      descriptionBase: 'Tactical gadgets for combat advantage'
    },
    {
      nameBase: 'Battle Coins',
      items: [500, 1000, 2500, 5000, 10000],
      priceMultiplier: 0.25,
      descriptionBase: 'Premium currency for exclusive items'
    }
  ],
  Adventure: [
    {
      nameBase: 'Tool Pack',
      items: ['Basic', 'Advanced', 'Elite', 'Master'],
      priceMultiplier: 1.5,
      descriptionBase: 'Collection of useful tools for exploration'
    },
    {
      nameBase: 'Map Bundle',
      items: ['Basic', 'Detailed', 'Complete', 'Interactive'],
      priceMultiplier: 1.3,
      descriptionBase: 'Maps revealing hidden locations'
    },
    {
      nameBase: 'Artifact Pack',
      items: ['Common', 'Rare', 'Epic', 'Legendary'],
      priceMultiplier: 2.5,
      descriptionBase: 'Collection of powerful artifacts'
    },
    {
      nameBase: 'Companion Pack',
      items: ['Basic', 'Advanced', 'Elite', 'Legendary'],
      priceMultiplier: 2,
      descriptionBase: 'AI companions to assist on adventures'
    },
    {
      nameBase: 'Skill Book',
      items: ['Basic', 'Advanced', 'Master', 'Legendary'],
      priceMultiplier: 1.8,
      descriptionBase: 'Learn new abilities and skills'
    },
    {
      nameBase: 'Exploration Kit',
      items: ['Basic', 'Advanced', 'Elite', 'Ultimate'],
      priceMultiplier: 2.2,
      descriptionBase: 'Complete kit for wilderness exploration'
    }
  ],
  Survival: [
    {
      nameBase: 'Survival Kit',
      items: ['Basic', 'Advanced', 'Elite', 'Ultimate'],
      priceMultiplier: 1.5,
      descriptionBase: 'Essential supplies for survival'
    },
    {
      nameBase: 'Weapon Bundle',
      items: ['Basic', 'Advanced', 'Elite', 'Legendary'],
      priceMultiplier: 2,
      descriptionBase: 'Collection of survival weapons'
    },
    {
      nameBase: 'Shelter Pack',
      items: ['Basic', 'Advanced', 'Elite', 'Fortress'],
      priceMultiplier: 2.5,
      descriptionBase: 'Building materials for shelters'
    },
    {
      nameBase: 'Food Supply',
      items: ['Basic', 'Emergency', 'Deluxe', 'Premium'],
      priceMultiplier: 1.2,
      descriptionBase: 'Food and water supplies'
    },
    {
      nameBase: 'Medicine Pack',
      items: ['Basic', 'Advanced', 'Elite', 'Complete'],
      priceMultiplier: 1.8,
      descriptionBase: 'Medical supplies for injuries'
    },
    {
      nameBase: 'Tool Set',
      items: ['Basic', 'Advanced', 'Professional', 'Ultimate'],
      priceMultiplier: 1.6,
      descriptionBase: 'Tools for crafting and building'
    }
  ]
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generatePrice(baseAmount: number, multiplier: number): number {
  return Math.round(baseAmount * multiplier * 100); // Convert to cents
}

function generateSkusForGame(gameName: GameName, category: string, gameId: string): Omit<Sku, 'created_at' | 'updated_at'>[] {
  const templates = skuTemplates[category as keyof typeof skuTemplates] || skuTemplates.RPG;
  const skus: Omit<Sku, 'created_at' | 'updated_at'>[] = [];

  let skuCount = 0;
  for (const template of templates) {
    for (const item of template.items) {
      if (skuCount >= 30) break; // Limit to 30 SKUs per game

      const basePrice = typeof item === 'number' ? item : 10;
      const price = generatePrice(basePrice, template.priceMultiplier);

      const nameEn = `${template.nameBase} ${item}`;
      const nameZh = `${template.nameBase} ${item}`;

      const descEn = typeof item === 'number'
        ? `${template.descriptionBase} x${item}.`
        : `${template.descriptionBase} - ${item} tier.`;

      const descZh = typeof item === 'number'
        ? `${template.descriptionBase} x${item}。`
        : `${template.descriptionBase} - ${item} 级。`;

      skus.push({
        id: randomUUID(),
        name: { en: nameEn, zh: nameZh },
        description: { en: descEn, zh: descZh },
        prices: { usd: price },
        image_url: 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU',
        game_id: gameId
      });

      skuCount++;
    }
    if (skuCount >= 30) break;
  }

  return skus;
}

function generateOrders(users: Profile[], skus: Sku[]): Omit<Order, 'created_at' | 'updated_at'>[] {
  const orders: Omit<Order, 'created_at' | 'updated_at'>[] = [];
  const statuses: Order['status'][] = ['pending', 'completed', 'failed'];
  const userIds = users.filter(u => u.role === 'USER').map(u => u.id);

  // Generate 50 sample orders
  for (let i = 0; i < 50; i++) {
    const sku = skus[Math.floor(Math.random() * skus.length)];
    const user = userIds[Math.floor(Math.random() * userIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Create timestamp within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);

    orders.push({
      id: randomUUID(),
      user_id: user,
      sku_id: sku.id,
      merchant_id: sku.game_id, // This will be updated after games are created
      amount: sku.prices.usd,
      currency: 'usd',
      status
    });
  }

  return orders;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function cleanupDatabase(): Promise<void> {
  console.log('🧹 Cleaning up existing data...');

  const { error: ordersError } = await supabase.from('orders').delete().neq('id', '');
  if (ordersError) throw ordersError;

  const { error: skusError } = await supabase.from('skus').delete().neq('id', '');
  if (skusError) throw skusError;

  const { error: gamesError } = await supabase.from('games').delete().neq('id', '');
  if (gamesError) throw gamesError;

  const { error: profilesError } = await supabase.from('profiles').delete().neq('id', '');
  if (profilesError) throw profilesError;

  console.log('✅ Database cleaned up');
}

async function seedProfiles(): Promise<Profile[]> {
  console.log('👥 Seeding user profiles...');

  // First check if profiles already exist
  const { data: existingProfiles, error: checkError } = await supabase
    .from('profiles')
    .select('*');

  if (checkError) throw checkError;

  if (existingProfiles && existingProfiles.length > 0) {
    console.log(`ℹ️  Found ${existingProfiles.length} existing profiles, skipping profile creation`);
    return existingProfiles;
  }

  // Try with service key bypass
  const { data, error } = await supabase
    .from('profiles')
    .insert(users.map(user => ({
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })))
    .select();

  if (error) {
    console.error('❌ Profile insert error:', error);

    // Try with service role key bypassing RLS
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .insert(users.map(user => ({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (adminError) throw adminError;
    if (!adminData) throw new Error('No data returned from admin profiles insert');

    console.log(`✅ Created ${adminData.length} user profiles (admin mode)`);
    return adminData;
  }

  if (!data) throw new Error('No data returned from profiles insert');

  console.log(`✅ Created ${data.length} user profiles`);
  return data;
}

async function seedGames(merchantProfiles: Profile[]): Promise<Game[]> {
  console.log('🎮 Seeding games...');

  const allGames: Omit<Game, 'created_at' | 'updated_at'>[] = [];

  for (const merchantGames of gamesData) {
    const merchant = merchantProfiles.find(m => m.id === merchantGames.merchantId);
    if (!merchant) continue;

    for (const gameData of merchantGames.games) {
      allGames.push({
        id: randomUUID(),
        name: gameData.name,
        description: gameData.description,
        banner_url: 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner',
        merchant_id: merchant.id
      });
    }
  }

  const { data, error } = await supabase
    .from('games')
    .insert(allGames.map(game => ({
      ...game,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })))
    .select();

  if (error) throw error;
  if (!data) throw new Error('No data returned from games insert');

  console.log(`✅ Created ${data.length} games`);
  return data;
}

async function seedSkus(games: Game[]): Promise<Sku[]> {
  console.log('🛍️ Seeding SKUs...');

  const allSkus: Omit<Sku, 'created_at' | 'updated_at'>[] = [];

  for (const game of games) {
    const category = gamesData
      .flatMap(md => md.games)
      .find(g => g.name.en === game.name.en)?.category || 'RPG';

    const skus = generateSkusForGame(game.name, category, game.id);
    allSkus.push(...skus);
  }

  // Insert SKUs in batches to avoid payload size limits
  const batchSize = 50;
  const insertedSkus: Sku[] = [];

  for (let i = 0; i < allSkus.length; i += batchSize) {
    const batch = allSkus.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('skus')
      .insert(batch.map(sku => ({
        ...sku,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (error) throw error;
    if (!data) throw new Error('No data returned from SKUs insert');

    insertedSkus.push(...data);
    await delay(100); // Small delay to avoid overwhelming the database
  }

  console.log(`✅ Created ${insertedSkus.length} SKUs`);
  return insertedSkus;
}

async function seedOrders(profiles: Profile[], skus: Skus[]): Promise<Order[]> {
  console.log('📦 Seeding orders...');

  // Create game lookup for merchant_id
  const gameMap = new Map<string, string>();

  // Fetch games to map SKUs to merchants
  const { data: games } = await supabase.from('games').select('id, merchant_id');
  if (games) {
    for (const game of games) {
      gameMap.set(game.id, game.merchant_id);
    }
  }

  const orders = generateOrders(profiles, skus);

  // Update merchant_id based on game mapping
  const enrichedOrders = orders.map(order => {
    const sku = skus.find(s => s.id === order.sku_id);
    if (sku) {
      return {
        ...order,
        merchant_id: gameMap.get(sku.game_id) || order.merchant_id
      };
    }
    return order;
  });

  const { data, error } = await supabase
    .from('orders')
    .insert(enrichedOrders.map(order => ({
      ...order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })))
    .select();

  if (error) throw error;
  if (!data) throw new Error('No data returned from orders insert');

  console.log(`✅ Created ${data.length} orders`);
  return data;
}

// =============================================================================
// VERIFICATION
// =============================================================================

async function verifySeed(): Promise<void> {
  console.log('\n🔍 Verifying seed data...');

  const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: gamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
  const { count: skusCount } = await supabase.from('skus').select('*', { count: 'exact', head: true });
  const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

  console.log('\n📊 Database Summary:');
  console.log(`   Profiles: ${profilesCount}`);
  console.log(`   Games: ${gamesCount}`);
  console.log(`   SKUs: ${skusCount}`);
  console.log(`   Orders: ${ordersCount}`);

  console.log('\n🎉 Seed completed successfully!');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main(): Promise<void> {
  console.log('🌱 Starting database seed for Game Recharge Platform...\n');

  try {
    // Uncomment the next line if you want to clean existing data
    // await cleanupDatabase();

    const profiles = await seedProfiles();
    const games = await seedGames(profiles.filter(p => p.role === 'MERCHANT'));
    const skus = await seedSkus(games);
    await seedOrders(profiles, skus);

    await verifySeed();

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
if (require.main === module) {
  main();
}

export { main as seedDatabase };