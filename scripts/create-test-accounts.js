#!/usr/bin/env node

/**
 * Create Test Accounts Script
 *
 * This script creates test accounts for the Game Recharge Platform
 * It supports multiple methods: Supabase Auth, direct database creation, etc.
 *
 * Usage: node scripts/create-test-accounts.js [options]
 *
 * Options:
 *   --supabase    Create accounts via Supabase Auth (recommended)
 *   --direct      Create accounts directly in database
 *   --list        List existing test accounts
 *   --cleanup     Remove test accounts
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n📋 Step ${step}: ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Test accounts configuration
const TEST_ACCOUNTS = [
  {
    id: "profile-user-1",
    email: "player1@test.com",
    password: "TestPlayer123!",
    role: "USER",
    merchant_name: null,
    description: "玩家测试账户 - Alex",
  },
  {
    id: "profile-user-2",
    email: "player2@test.com",
    password: "TestPlayer456!",
    role: "USER",
    merchant_name: null,
    description: "玩家测试账户 - Sarah",
  },
  {
    id: "profile-merchant-1",
    email: "merchant1@fantasygames.com",
    password: "TestMerchant789!",
    role: "MERCHANT",
    merchant_name: "Fantasy Games Studio",
    description: "商家测试账户 - Fantasy Games Studio",
  },
  {
    id: "profile-merchant-2",
    email: "merchant2@actiongames.com",
    password: "TestMerchant321!",
    role: "MERCHANT",
    merchant_name: "Action Games Inc",
    description: "商家测试账户 - Action Games Inc",
  },
  {
    id: "profile-admin-1",
    email: "admin@test.com",
    password: "TestAdmin000!",
    role: "ADMIN",
    merchant_name: "Platform Administrator",
    description: "管理员测试账户",
  },
];

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  supabase: args.includes("--supabase"),
  direct: args.includes("--direct"),
  list: args.includes("--list"),
  cleanup: args.includes("--cleanup"),
  help: args.includes("--help") || args.includes("-h"),
};

async function createSupabaseAccounts() {
  logStep(1, "Creating accounts via Supabase Auth");

  for (const account of TEST_ACCOUNTS) {
    try {
      logInfo(`Creating account: ${account.email} (${account.description})`);

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            role: account.role,
            merchant_name: account.merchant_name,
            description: account.description,
          },
        });

      if (authError) {
        // Account might already exist
        if (authError.message.includes("already registered")) {
          logWarning(`Account ${account.email} already exists`);
        } else {
          logError(`Failed to create ${account.email}: ${authError.message}`);
          continue;
        }
      } else {
        logSuccess(`Created auth user: ${account.email}`);
      }

      // Wait a moment between account creations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logError(`Error creating ${account.email}: ${error.message}`);
    }
  }
}

async function createDirectAccounts() {
  logStep(2, "Creating accounts directly in database");

  for (const account of TEST_ACCOUNTS) {
    try {
      logInfo(`Creating profile: ${account.id} (${account.description})`);

      // Insert profile directly (for testing)
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: account.id,
          role: account.role,
          merchant_name: account.merchant_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        logError(`Failed to create profile ${account.id}: ${error.message}`);
      } else {
        logSuccess(`Created profile: ${account.id}`);
      }
    } catch (error) {
      logError(`Error creating profile ${account.id}: ${error.message}`);
    }
  }
}

async function listAccounts() {
  logStep(0, "Listing existing accounts");

  try {
    // List profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*");

    if (profileError) {
      logError(`Failed to fetch profiles: ${profileError.message}`);
      return;
    }

    if (!profiles || profiles.length === 0) {
      logInfo("No profiles found in database");
      return;
    }

    log("\n📊 Existing Profiles:");
    profiles.forEach((profile, index) => {
      log(`\n${index + 1}. ${profile.role}`, colors.cyan);
      log(`   ID: ${profile.id}`);
      log(`   Merchant Name: ${profile.merchant_name || "N/A"}`);
      log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
    });

    log(`\n📊 Total: ${profiles.length} profiles`);
  } catch (error) {
    logError(`Error listing accounts: ${error.message}`);
  }
}

async function cleanupAccounts() {
  logStep(1, "Cleaning up test accounts");

  const testIds = TEST_ACCOUNTS.map((acc) => acc.id);

  try {
    logInfo("Deleting test profiles...");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .in("id", testIds);

    if (error) {
      logError(`Failed to cleanup profiles: ${error.message}`);
    } else {
      logSuccess(`Deleted ${testIds.length} test profiles`);
    }

    // Note: We can't easily delete auth users via service role key
    logWarning(
      "Auth users may need to be deleted manually in Supabase Dashboard",
    );
  } catch (error) {
    logError(`Error during cleanup: ${error.message}`);
  }
}

function showHelp() {
  log("\n🚀 Test Accounts Management Script", colors.cyan);
  log("\nUsage: node scripts/create-test-accounts.js [options]", colors.white);
  log("\nOptions:", colors.yellow);
  log(
    "  --supabase    Create accounts via Supabase Auth (recommended)",
    colors.white,
  );
  log("  --direct      Create accounts directly in database", colors.white);
  log("  --list        List existing test accounts", colors.white);
  log("  --cleanup     Remove test accounts", colors.white);
  log("  --help, -h    Show this help message", colors.white);
  log("\nTest Accounts:", colors.blue);
  TEST_ACCOUNTS.forEach((account, index) => {
    log(
      `  ${index + 1}. ${account.email} (${account.description})`,
      colors.white,
    );
  });
}

function printAccountCredentials() {
  log("\n📧 Test Account Credentials", colors.cyan);
  log("\n⚠️  IMPORTANT: Save these credentials for testing!", colors.yellow);
  log("\n" + "=".repeat(50));

  TEST_ACCOUNTS.forEach((account, index) => {
    log(`\n${index + 1}. ${account.description}`, colors.blue);
    log(`   Email: ${account.email}`, colors.white);
    log(`   Password: ${account.password}`, colors.white);
    log(`   Role: ${account.role}`, colors.white);
    if (account.merchant_name) {
      log(`   Company: ${account.merchant_name}`, colors.white);
    }
  });

  log("\n" + "=".repeat(50));
  log("\n🎯 Usage Notes:", colors.cyan);
  log("1. Use these emails to register on your application", colors.white);
  log("2. Test with different roles (USER, MERCHANT, ADMIN)", colors.white);
  log("3. Admin account can access all dashboard features", colors.white);
  log("4. Merchant accounts can manage their own games and SKUs", colors.white);
  log(
    "5. User accounts can purchase items and view their orders",
    colors.white,
  );
}

// Main function
async function main() {
  try {
    if (options.help) {
      showHelp();
      return;
    }

    log("🚀 Test Accounts Management", colors.cyan);

    // Show configuration
    log("\n⚙️  Configuration:", colors.yellow);
    log(`  Supabase Auth: ${options.supabase ? "Yes" : "No"}`, colors.white);
    log(`  Direct DB: ${options.direct ? "Yes" : "No"}`, colors.white);
    log(`  List accounts: ${options.list ? "Yes" : "No"}`, colors.white);
    log(`  Cleanup: ${options.cleanup ? "Yes" : "No"}`, colors.white);

    if (options.list) {
      await listAccounts();
      printAccountCredentials();
    } else if (options.cleanup) {
      await cleanupAccounts();
    } else {
      printAccountCredentials();

      if (options.supabase) {
        await createSupabaseAccounts();
      }

      if (options.direct) {
        await createDirectAccounts();
      }

      if (!options.supabase && !options.direct) {
        logWarning("No creation method specified. Use --supabase or --direct");
      }

      log("\n🎉 Account creation process completed!", colors.green);
      log(
        "You can now use the credentials above to test your application.",
        colors.blue,
      );
    }
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
