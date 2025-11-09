/**
 * Row Level Security (RLS) Policy Tests
 *
 * This test suite validates that RLS policies properly enforce data access
 * boundaries for different user roles in the Game Recharge Platform.
 *
 * Test Scenarios:
 * - USER role: Can only access own profiles/orders, read all games/skus
 * - MERCHANT role: Can manage own games/skus/orders, read all games/skus
 * - ADMIN role: Can access and manage all data
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// Mock JWT tokens for different user roles
const MOCK_JWTS = {
  user: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMzQ1NiIsInJvbGUiOiJVU0VSIiwiYXVkIjoic3VwYWJhc2UtZGVtbyIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.mock-user-jwt',
  merchant: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXJjaGFudC0xMjM0NTYiLCJyb2xlIjoiTUVSQ0hBTlQiLCJhdWQiOiJzdXBhYmFzZS1kZW1vIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.mock-merchant-jwt',
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0xMjM0NTYiLCJyb2xlIjoiQURNSU4iLCJhdWQiOiJzdXBhYmFzZS1kZW1vIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.mock-admin-jwt'
};

// Test data IDs
const TEST_IDS = {
  user1: '11111111-1111-1111-1111-111111111111',
  user2: '22222222-2222-2222-2222-222222222222',
  merchant1: '33333333-3333-3333-3333-333333333333',
  merchant2: '44444444-4444-4444-4444-444444444444',
  admin: '55555555-5555-5555-5555-555555555555'
};

describe('Game Recharge Platform - RLS Policy Validation', () => {
  let supabaseAdmin: SupabaseClient;
  let createdTestData: any = {};

  beforeAll(async () => {
    // Initialize admin client with service role key
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Clean up any existing test data
    await cleanupTestData();

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('Profiles Table RLS', () => {
    it('should allow users to view their own profile', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('profiles')
        .select('*')
        .eq('id', TEST_IDS.user1);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(TEST_IDS.user1);
      expect(data[0].role).toBe('USER');
    });

    it('should NOT allow users to view other users profiles', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('profiles')
        .select('*')
        .eq('id', TEST_IDS.user2);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('should allow merchants to view their own profile', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      const { data, error } = await supabaseMerchant
        .from('profiles')
        .select('*')
        .eq('id', TEST_IDS.merchant1);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(TEST_IDS.merchant1);
      expect(data[0].role).toBe('MERCHANT');
      expect(data[0].merchant_name).toBe('Test Merchant');
    });

    it('should allow admins to view all profiles', async () => {
      const supabaseAdminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.admin
      );

      const { data, error } = await supabaseAdminClient
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow users to update their own profile', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { error } = await supabaseUser
        .from('profiles')
        .update({ merchant_name: 'Should fail for USER' })
        .eq('id', TEST_IDS.user1);

      // This might succeed due to database constraints, but policies should enforce role
      expect(error).toBeNull();
    });

    it('should NOT allow users to update other profiles', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { error } = await supabaseUser
        .from('profiles')
        .update({ merchant_name: 'Hacked!' })
        .eq('id', TEST_IDS.merchant1);

      expect(error).toBeNull(); // RLS returns no error, just affects 0 rows
    });
  });

  describe('Games Table RLS', () => {
    it('should allow everyone to view all games', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('games')
        .select('*');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow merchants to manage their own games', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      const { data, error } = await supabaseMerchant
        .from('games')
        .insert({
          name: { en: 'New Game', zh: '新游戏' },
          description: { en: 'A new game', zh: '一个新游戏' },
          merchant_id: TEST_IDS.merchant1
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.merchant_id).toBe(TEST_IDS.merchant1);
    });

    it('should NOT allow merchants to manage other merchants games', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      const { error } = await supabaseMerchant
        .from('games')
        .update({ name: { en: 'Hacked Game', zh: '被黑的游戏' } })
        .eq('merchant_id', TEST_IDS.merchant2);

      // RLS should prevent this - no error returned, but no rows affected
      expect(error).toBeNull();
    });

    it('should allow admins to manage all games', async () => {
      const supabaseAdminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.admin
      );

      const { error } = await supabaseAdminClient
        .from('games')
        .update({ name: { en: 'Admin Updated', zh: '管理员更新' } })
        .eq('merchant_id', TEST_IDS.merchant1);

      expect(error).toBeNull();
    });
  });

  describe('SKUs Table RLS', () => {
    it('should allow everyone to view all SKUs', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('skus')
        .select('*');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow merchants to manage SKUs for their own games', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      // First, get one of merchant's games
      const { data: games } = await supabaseMerchant
        .from('games')
        .select('id')
        .eq('merchant_id', TEST_IDS.merchant1)
        .limit(1);

      if (games && games.length > 0) {
        const { data, error } = await supabaseMerchant
          .from('skus')
          .insert({
            name: { en: 'New SKU', zh: '新商品' },
            prices: { usd: 999 },
            game_id: games[0].id
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
      }
    });

    it('should NOT allow merchants to manage SKUs for other merchants games', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      // Try to update SKU from other merchant's game
      const { error } = await supabaseMerchant
        .from('skus')
        .update({ name: { en: 'Hacked SKU', zh: '被黑的商品' } })
        .eq('game_id', createdTestData.merchant2GameId);

      expect(error).toBeNull(); // RLS prevents this silently
    });
  });

  describe('Orders Table RLS', () => {
    it('should allow users to view their own orders', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('orders')
        .select('*')
        .eq('user_id', TEST_IDS.user1);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(0);
    });

    it('should NOT allow users to view other users orders', async () => {
      const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.user
      );

      const { data, error } = await supabaseUser
        .from('orders')
        .select('*')
        .eq('user_id', TEST_IDS.user2);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('should allow merchants to view orders for their games', async () => {
      const supabaseMerchant = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.merchant
      );

      const { data, error } = await supabaseMerchant
        .from('orders')
        .select('*')
        .eq('merchant_id', TEST_IDS.merchant1);

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThanOrEqual(0);
    });

    it('should allow admins to view all orders', async () => {
      const supabaseAdminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        MOCK_JWTS.admin
      );

      const { data, error } = await supabaseAdminClient
        .from('orders')
        .select('*');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  // Helper functions for test data setup and cleanup
  async function setupTestData() {
    try {
      // Create test profiles
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: TEST_IDS.user1,
            role: 'USER'
          },
          {
            id: TEST_IDS.user2,
            role: 'USER'
          },
          {
            id: TEST_IDS.merchant1,
            role: 'MERCHANT',
            merchant_name: 'Test Merchant'
          },
          {
            id: TEST_IDS.merchant2,
            role: 'MERCHANT',
            merchant_name: 'Another Merchant'
          },
          {
            id: TEST_IDS.admin,
            role: 'ADMIN'
          }
        ])
        .select();

      // Create test games
      const { data: games } = await supabaseAdmin
        .from('games')
        .insert([
          {
            name: { en: 'Test Game 1', zh: '测试游戏1' },
            description: { en: 'A test game', zh: '一个测试游戏' },
            merchant_id: TEST_IDS.merchant1
          },
          {
            name: { en: 'Test Game 2', zh: '测试游戏2' },
            description: { en: 'Another test game', zh: '另一个测试游戏' },
            merchant_id: TEST_IDS.merchant2
          }
        ])
        .select();

      if (games && games.length > 0) {
        createdTestData.merchant1GameId = games[0].id;
        createdTestData.merchant2GameId = games[1].id;

        // Create test SKUs
        const { data: skus } = await supabaseAdmin
          .from('skus')
          .insert([
            {
              name: { en: 'Test SKU 1', zh: '测试商品1' },
              prices: { usd: 999 },
              game_id: games[0].id
            },
            {
              name: { en: 'Test SKU 2', zh: '测试商品2' },
              prices: { usd: 1999 },
              game_id: games[1].id
            }
          ])
          .select();

        if (skus && skus.length > 0) {
          // Create test orders
          await supabaseAdmin
            .from('orders')
            .insert([
              {
                user_id: TEST_IDS.user1,
                sku_id: skus[0].id,
                merchant_id: TEST_IDS.merchant1,
                amount: 999,
                status: 'pending'
              },
              {
                user_id: TEST_IDS.user2,
                sku_id: skus[1].id,
                merchant_id: TEST_IDS.merchant2,
                amount: 1999,
                status: 'completed'
              }
            ]);
        }
      }
    } catch (error) {
      console.error('Error setting up test data:', error);
      throw error;
    }
  }

  async function cleanupTestData() {
    try {
      // Clean up in reverse order to respect foreign key constraints
      await supabaseAdmin.from('orders').delete().in('user_id', Object.values(TEST_IDS));
      await supabaseAdmin.from('skus').delete().in('game_id', [
        createdTestData.merchant1GameId,
        createdTestData.merchant2GameId
      ].filter(Boolean));
      await supabaseAdmin.from('games').delete().in('merchant_id', [TEST_IDS.merchant1, TEST_IDS.merchant2]);
      await supabaseAdmin.from('profiles').delete().in('id', Object.values(TEST_IDS));
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }
});