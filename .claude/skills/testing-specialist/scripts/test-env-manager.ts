#!/usr/bin/env tsx

/**
 * Test Environment Manager
 *
 * A script for seeding, cleaning, and managing the test database and environment.
 * This ensures that all automated tests run against a consistent and predictable state.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Command } from "commander";
import jwt from "jsonwebtoken";

// --- Configuration ---
// These should be loaded from environment variables, especially in a CI environment.
const SUPABASE_URL = process.env.SUPABASE_URL || "http://localhost:54321";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || "your-service-role-key";
const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-jwt-token-for-testing";

// --- Test Data ---
const testData = {
  profiles: [
    {
      id: "8f5a62f7-8c37-4e42-984a-8f7233525b7c",
      email: "admin@example.com",
      role: "ADMIN",
    },
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      email: "merchant@example.com",
      role: "MERCHANT",
    },
    {
      id: "e1b5c1a3-1b1c-4b1a-9c1c-1b1c1b1c1b1c",
      email: "player@example.com",
      role: "PLAYER",
    },
  ],
  games: [
    {
      id: 1,
      name: "Cosmic Adventure",
      merchant_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    },
    {
      id: 2,
      name: "Ocean Explorer",
      merchant_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    },
    // A game for another merchant to test RLS
    {
      id: 3,
      name: "Forbidden Tomb",
      merchant_id: "c3d479f4-7ac1-0b58-cc43-72a5670e02b2",
    },
  ],
  skus: [
    { id: 1, game_id: 1, name: "100 Gold Coins", price_usd: 99, stock: 1000 },
    { id: 2, game_id: 1, name: "500 Gold Coins", price_usd: 499, stock: 500 },
    { id: 3, game_id: 2, name: "Starter Pack", price_usd: 199, stock: 9999 },
  ],
};

// --- Database Client ---
let supabase: SupabaseClient;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error(
        "Supabase URL and Service Key must be provided via environment variables.",
      );
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabase;
}

// --- Script Commands ---

async function cleanup() {
  console.log("🧹 Cleaning up test database...");
  const client = getSupabaseClient();
  // The order matters due to foreign key constraints. Truncate tables that are depended on last.
  const tables = ["orders", "skus", "games", "profiles"];
  for (const table of tables) {
    const { error } = await client
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows
    if (error) {
      console.error(`❌ Error cleaning table ${table}:`, error.message);
      throw error;
    }
    console.log(`  - Table '${table}' cleaned.`);
  }
  console.log("✅ Database cleanup complete.");
}

async function seed() {
  console.log("🌱 Seeding test database...");
  const client = getSupabaseClient();

  // First, ensure the database is clean
  await cleanup();

  console.log("  - Inserting data...");
  for (const [tableName, data] of Object.entries(testData)) {
    const { error } = await client.from(tableName).insert(data as any);
    if (error) {
      console.error(`❌ Error seeding table ${tableName}:`, error.message);
      throw error;
    }
    console.log(`    - Inserted ${data.length} rows into '${tableName}'.`);
  }

  console.log("✅ Database seeding complete.");
}

function generateJwt(userId: string, role: string, expires: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
  }
  const payload = {
    sub: userId,
    user_role: role, // Corresponds to what your RLS policies might check
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + parseInt(expires) * 60, // Expiry in minutes
  };
  const token = jwt.sign(payload, JWT_SECRET);
  console.log("🔑 Generated JWT:");
  console.log(token);
  return token;
}

// --- CLI Definition ---

async function main() {
  const program = new Command();

  program
    .name("test-env-manager")
    .description(
      "A CLI tool to manage the test environment for the Game Recharge MVP.",
    );

  program
    .command("seed")
    .description(
      "Cleans and seeds the test database with a consistent dataset.",
    )
    .action(seed);

  program
    .command("cleanup")
    .description("Cleans all data from the test tables.")
    .action(cleanup);

  program
    .command("generate-jwt")
    .description(
      "Generates a mock JWT for testing authenticated routes and RLS.",
    )
    .requiredOption(
      "-u, --userId <uuid>",
      "The user ID (UUID) to include in the token.",
    )
    .requiredOption(
      "-r, --role <role>",
      "The user role (e.g., ADMIN, MERCHANT) to include.",
    )
    .option(
      "-e, --expires <minutes>",
      "Token expiration time in minutes.",
      "60",
    )
    .action((options) => {
      generateJwt(options.userId, options.role, options.expires);
    });

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error("❌ An error occurred:", error);
    process.exit(1);
  }
}

main();
