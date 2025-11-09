/**
 * Supabase Client (Client-Side)
 *
 * This client is used in React Components on the browser side.
 * It uses the anonymous key and respects Row Level Security (RLS).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔗 Supabase Client initializing...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

/**
 * Creates a Supabase client for client-side usage
 * This client respects Row Level Security (RLS) policies
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Enable auto-refresh for client-side usage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Custom-Header': 'game-recharge-platform',
        },
      },
    });

    return client;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw new Error('Client database connection failed');
  }
}

// Singleton instance for better performance
let clientInstance: SupabaseClient<Database> | null = null;

/**
 * Get cached client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!clientInstance) {
    clientInstance = createSupabaseClient();
  }
  return clientInstance;
}

/**
 * Export the singleton as default for easier usage
 */
export const supabase = getSupabaseClient();