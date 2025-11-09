#!/usr/bin/env node

/**
 * Game Recharge Platform - SQL Seed Runner
 *
 * This script runs SQL commands directly using Supabase client
 * to bypass foreign key constraints for initial seeding.
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`);
  console.error('\n💡 Make sure .env.local exists and contains these variables.');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');

// Create client with service role for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeedSQL() {
  console.log('🌱 Running SQL seed commands...');

  try {
    // First, disable foreign key constraints temporarily
    console.log('🔧 Temporarily disabling foreign key constraints...');

    const { error: fkError } = await supabase
      .rpc('disable_foreign_key_constraints');

    if (fkError && !fkError.message.includes('function does not exist')) {
      console.log('⚠️ Could not disable FK constraints, proceeding anyway...');
    }

    // Step 1: Insert Profiles
    console.log('👥 Creating user profiles...');
    const profileSQL = `
      INSERT INTO profiles (id, role, merchant_name, created_at, updated_at) VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'Platform Administrator', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440002', 'MERCHANT', 'Fantasy Games Studio', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440003', 'MERCHANT', 'Action Games Inc', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440004', 'USER', NULL, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `;

    const { error: profileError } = await supabase.rpc('execute_sql', { sql: profileSQL });

    if (profileError) {
      // Try using raw SQL via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: profileSQL })
      });

      if (!response.ok) {
        console.error('Profile creation failed, trying alternative approach...');

        // Use direct insert as fallback
        const profiles = [
          { id: '550e8400-e29b-41d4-a716-446655440001', role: 'ADMIN', merchant_name: 'Platform Administrator' },
          { id: '550e8400-e29b-41d4-a716-446655440002', role: 'MERCHANT', merchant_name: 'Fantasy Games Studio' },
          { id: '550e8400-e29b-41d4-a716-446655440003', role: 'MERCHANT', merchant_name: 'Action Games Inc' },
          { id: '550e8400-e29b-41d4-a716-446655440004', role: 'USER', merchant_name: null }
        ];

        for (const profile of profiles) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              ...profile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Failed to insert profile ${profile.id}:`, insertError.message);
          } else {
            console.log(`✅ Created profile: ${profile.role} - ${profile.merchant_name || 'User'}`);
          }
        }
      } else {
        console.log('✅ Profiles created successfully via SQL');
      }
    } else {
      console.log('✅ Profiles created successfully via RPC');
    }

    // Step 2: Insert Games
    console.log('🎮 Creating games...');
    const gamesSQL = `
      INSERT INTO games (id, name, description, banner_url, merchant_id, created_at, updated_at) VALUES
      ('game-001', '{"en": "Dragon Quest Online", "zh": "龙之传说在线"}', '{"en": "Embark on an epic adventure in a vast fantasy world.", "zh": "在广阔的奇幻世界中踏上史诗般的冒险。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
      ('game-002', '{"en": "Magic Academy", "zh": "魔法学院"}', '{"en": "Learn powerful spells in this wizarding school RPG.", "zh": "学习强大的咒语，在这所巫师学校RPG中。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
      ('game-003', '{"en": "Elven Kingdom", "zh": "精灵王国"}', '{"en": "Build your elven kingdom in this strategic simulation.", "zh": "建立你的精灵王国，在这款战略模拟游戏中。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
      ('game-004', '{"en": "Dragon Riders", "zh": "龙骑士"}', '{"en": "Tame and ride powerful dragons in aerial combat.", "zh": "在空中战斗中驯服和骑乘强大的巨龙。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
      ('game-005', '{"en": "Mystic Realms", "zh": "神秘领域"}', '{"en": "Explore mystical realms with ancient magic.", "zh": "探索充满古老魔法的神秘领域。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
      ('game-006', '{"en": "Cyber Strike 2077", "zh": "赛博突击2077"}', '{"en": "Experience intense multiplayer combat in cyberpunk future.", "zh": "在赛博朋克未来中体验激烈的多玩家战斗。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
      ('game-007', '{"en": "Speed Rivals", "zh": "极速对手"}', '{"en": "High-octane racing action with stunning graphics.", "zh": "拥有惊艳画面的高能量赛车动作。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
      ('game-008', '{"en": "Last Survival", "zh": "最后生存者"}', '{"en": "Battle to be the last one standing.", "zh": "战斗成为最后的幸存者。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
      ('game-009', '{"en": "Space Warriors", "zh": "太空战士"}', '{"en": "Command your fleet in epic space battles.", "zh": "在史诗般的太空战斗中指挥你的舰队。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
      ('game-010', '{"en": "Zombie Apocalypse", "zh": "僵尸末日"}', '{"en": "Survive in a post-apocalyptic world.", "zh": "在后末日世界中生存。"}', 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `;

    const { error: gamesError } = await supabase.rpc('execute_sql', { sql: gamesSQL });

    if (gamesError) {
      console.log('Using direct insert for games...');

      const games = [
        { id: 'game-001', name: { en: 'Dragon Quest Online', zh: '龙之传说在线' }, merchant_id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: 'game-002', name: { en: 'Magic Academy', zh: '魔法学院' }, merchant_id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: 'game-003', name: { en: 'Elven Kingdom', zh: '精灵王国' }, merchant_id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: 'game-004', name: { en: 'Dragon Riders', zh: '龙骑士' }, merchant_id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: 'game-005', name: { en: 'Mystic Realms', zh: '神秘领域' }, merchant_id: '550e8400-e29b-41d4-a716-446655440002' },
        { id: 'game-006', name: { en: 'Cyber Strike 2077', zh: '赛博突击2077' }, merchant_id: '550e8400-e29b-41d4-a716-446655440003' },
        { id: 'game-007', name: { en: 'Speed Rivals', zh: '极速对手' }, merchant_id: '550e8400-e29b-41d4-a716-446655440003' },
        { id: 'game-008', name: { en: 'Last Survival', zh: '最后生存者' }, merchant_id: '550e8400-e29b-41d4-a716-446655440003' },
        { id: 'game-009', name: { en: 'Space Warriors', zh: '太空战士' }, merchant_id: '550e8400-e29b-41d4-a716-446655440003' },
        { id: 'game-010', name: { en: 'Zombie Apocalypse', zh: '僵尸末日' }, merchant_id: '550e8400-e29b-41d4-a716-446655440003' }
      ];

      for (const game of games) {
        const { error: insertError } = await supabase
          .from('games')
          .insert({
            ...game,
            description: { en: 'Sample description', zh: '示例描述' },
            banner_url: 'https://placehold.co/1280x720/FFDDAA/87CEEB?text=Game+Banner',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Failed to insert game ${game.id}:`, insertError.message);
        } else {
          console.log(`✅ Created game: ${game.name.en}`);
        }
      }
    } else {
      console.log('✅ Games created successfully via SQL');
    }

    // Create sample SKUs for first two games
    console.log('🛍️ Creating sample SKUs...');
    const skus = [
      // Dragon Quest Online SKUs
      { id: 'sku-001-001', game_id: 'game-001', name: { en: 'Crystal Pack x50', zh: '水晶包 x50' }, prices: { usd: 499 } },
      { id: 'sku-001-002', game_id: 'game-001', name: { en: 'Crystal Pack x100', zh: '水晶包 x100' }, prices: { usd: 999 } },
      { id: 'sku-001-003', game_id: 'game-001', name: { en: 'Starter Bundle', zh: '新手包' }, prices: { usd: 799 } },
      { id: 'sku-001-004', game_id: 'game-001', name: { en: 'VIP Status 30 Days', zh: 'VIP身份 30天' }, prices: { usd: 3999 } },
      { id: 'sku-001-005', game_id: 'game-001', name: { en: 'Dragon Mount', zh: '龙坐骑' }, prices: { usd: 4999 } },

      // Cyber Strike 2077 SKUs
      { id: 'sku-002-001', game_id: 'game-002', name: { en: 'Weapon Pack Basic', zh: '武器包基础版' }, prices: { usd: 999 } },
      { id: 'sku-002-002', game_id: 'game-002', name: { en: 'Ammo Pack x500', zh: '弹药包 x500' }, prices: { usd: 999 } },
      { id: 'sku-002-003', game_id: 'game-002', name: { en: 'Battle Pass Season 1', zh: '战斗通行证第1季' }, prices: { usd: 1999 } },
      { id: 'sku-002-004', game_id: 'game-002', name: { en: 'Credits x1000', zh: '积分 x1000' }, prices: { usd: 199 } },
      { id: 'sku-002-005', game_id: 'game-002', name: { en: 'Gadget Bundle Advanced', zh: '道具包高级版' }, prices: { usd: 1599 } }
    ];

    for (const sku of skus) {
      const { error: insertError } = await supabase
        .from('skus')
        .insert({
          ...sku,
          description: { en: 'Sample SKU description', zh: '示例SKU描述' },
          image_url: 'https://placehold.co/400x400/87CEEB/FFFFFF?text=SKU',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Failed to insert SKU ${sku.id}:`, insertError.message);
      } else {
        console.log(`✅ Created SKU: ${sku.name.en}`);
      }
    }

    // Create sample orders
    console.log('📦 Creating sample orders...');
    const orders = [
      { id: 'order-001', user_id: '550e8400-e29b-41d4-a716-446655440004', sku_id: 'sku-001-001', merchant_id: '550e8400-e29b-41d4-a716-446655440002', amount: 499, status: 'completed' },
      { id: 'order-002', user_id: '550e8400-e29b-41d4-a716-446655440004', sku_id: 'sku-002-001', merchant_id: '550e8400-e29b-41d4-a716-446655440003', amount: 999, status: 'completed' },
      { id: 'order-003', user_id: '550e8400-e29b-41d4-a716-446655440004', sku_id: 'sku-001-003', merchant_id: '550e8400-e29b-41d4-a716-446655440002', amount: 799, status: 'pending' },
      { id: 'order-004', user_id: '550e8400-e29b-41d4-a716-446655440004', sku_id: 'sku-002-003', merchant_id: '550e8400-e29b-41d4-a716-446655440003', amount: 1999, status: 'completed' },
      { id: 'order-005', user_id: '550e8400-e29b-41d4-a716-446655440004', sku_id: 'sku-001-005', merchant_id: '550e8400-e29b-41d4-a716-446655440002', amount: 4999, status: 'failed' }
    ];

    for (const order of orders) {
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          ...order,
          currency: 'usd',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Failed to insert order ${order.id}:`, insertError.message);
      } else {
        console.log(`✅ Created order: ${order.status}`);
      }
    }

    // Verify data
    console.log('\n🔍 Verifying seed data...');
    const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: gamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
    const { count: skusCount } = await supabase.from('skus').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Profiles: ${profilesCount || 0}`);
    console.log(`   🎮 Games: ${gamesCount || 0}`);
    console.log(`   🛍️ SKUs: ${skusCount || 0}`);
    console.log(`   📦 Orders: ${ordersCount || 0}`);

    console.log('\n🎉 Seed completed successfully!');

  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run the seed
runSeedSQL();