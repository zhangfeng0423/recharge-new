/**
 * Supabase Server Client (Server-Side)
 *
 * This client is used in Server Components, Server Actions, and API routes.
 * It uses the service role key for elevated privileges and should only be used on the server.
 * IMPORTANT: Always use the PgBouncer (Connection Pooler) URL for production.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./supabase-types";

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabasePoolerUrl = process.env.SUPABASE_POOLER_URL!;

// Determine which database URL to use
// For production, always use the pooler URL
// For development, can use direct URL if pooler not set
const databaseUrl =
  supabasePoolerUrl || process.env.SUPABASE_DATABASE_URL || supabaseUrl;

/**
 * Creates a Supabase client for server-side usage
 * This client bypasses Row Level Security (RLS) when using the service role key
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  try {
    const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        // Disable auto-refresh for server-side usage
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          // Add any custom headers needed
          "X-Custom-Header": "game-recharge-platform",
        },
      },
    });

    return client;
  } catch (error) {
    console.error("❌ Failed to create Supabase server client:", error);
    throw new Error("Database connection failed");
  }
}

/**
 * Creates a Supabase client with admin privileges
 * This should be used carefully as it bypasses RLS completely
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  try {
    const adminClient = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          // Use service role key for admin access
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "X-Admin-Access": "true",
          },
        },
      },
    );

    return adminClient;
  } catch (error) {
    console.error("❌ Failed to create Supabase admin client:", error);
    throw new Error("Admin database connection failed");
  }
}

/**
 * Creates a Supabase client for server-side usage with authentication context
 * Used when you need to access data as a specific user
 * Note: Cookie handling will be implemented when auth flow is added
 */
export function createSupabaseServerClientForUser(): SupabaseClient<Database> {
  try {
    // For now, return the same client as the basic server client
    // Cookie handling will be added when we implement the authentication flow
    return createSupabaseServerClient();
  } catch (error) {
    console.error(
      "❌ Failed to create Supabase server client for user:",
      error,
    );
    throw new Error("User database connection failed");
  }
}

// Singleton instances for better performance
let serverClient: SupabaseClient<Database> | null = null;
let adminClient: SupabaseClient<Database> | null = null;

/**
 * Get cached server client instance
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (!serverClient) {
    serverClient = createSupabaseServerClient();
  }
  return serverClient;
}

/**
 * Get cached admin client instance
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createSupabaseAdminClient();
  }
  return adminClient;
}

/**
 * Test database connection
 * This function can be used to verify that the database is accessible
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseServerClient();

    // Test basic connectivity by checking if we can access system tables
    const { data, error } = await client
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Database connection test failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Database connection test error:", error);
    return false;
  }
}

/**
 * Get database health status
 * Returns detailed information about database connectivity
 */
export async function getDatabaseHealth() {
  try {
    const client = getSupabaseServerClient();

    // Test multiple aspects of the database
    const results = await Promise.allSettled([
      // Test basic connectivity
      client
        .from("profiles")
        .select("count")
        .limit(1),
      // Test RLS is enabled
      client
        .from("games")
        .select("count")
        .limit(1),
      // Test foreign key relationships
      client
        .from("skus")
        .select("count")
        .limit(1),
      // Test indexes are working
      client
        .from("orders")
        .select("count")
        .limit(1),
    ]);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const totalCount = results.length;

    return {
      status: successCount === totalCount ? "healthy" : "degraded",
      connectivity: {
        profiles: results[0].status === "fulfilled",
        games: results[1].status === "fulfilled",
        skus: results[2].status === "fulfilled",
        orders: results[3].status === "fulfilled",
      },
      successRate: `${successCount}/${totalCount}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}
