#!/usr/bin/env node

/**
 * Setup Admin User Script
 *
 * This script creates an admin user in the database.
 * Usage: node scripts/setup-admin.js <email> <password>
 */

const { createClient } = require("@supabase/supabase-js");
const { randomBytes } = require("crypto");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create Supabase admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser(email, password) {
  console.log("🚀 Creating admin user...");
  console.log(`📧 Email: ${email}`);

  try {
    // Step 1: Create the auth user
    console.log("1️⃣ Creating authentication user...");
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("❌ Failed to create auth user:", authError.message);
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log("✅ Auth user created successfully");
    console.log(`   User ID: ${userId}`);

    // Step 2: Create the profile with ADMIN role
    console.log("2️⃣ Creating admin profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        role: "ADMIN",
        merchant_name: "Platform Administrator",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Failed to create admin profile:", profileError.message);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      process.exit(1);
    }

    console.log("✅ Admin profile created successfully");
    console.log(`   Profile ID: ${profileData.id}`);
    console.log(`   Role: ${profileData.role}`);

    // Step 3: Verify the admin user
    console.log("3️⃣ Verifying admin user...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (verifyError || verifyData.role !== "ADMIN") {
      console.error("❌ Admin verification failed");
      process.exit(1);
    }

    console.log("✅ Admin user verified successfully");

    console.log("\n🎉 ADMIN USER SETUP COMPLETE!");
    console.log("\n📋 Login Details:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ADMIN`);
    console.log(`   User ID: ${userId}`);

    console.log("\n🔗 Login URLs:");
    console.log("   Local: http://localhost:3000/auth");
    console.log("   Production: https://your-domain.com/auth");

    console.log("\n⚠️  IMPORTANT:");
    console.log("   - Store these credentials securely");
    console.log("   - Change the password after first login");
    console.log("   - Never share these credentials");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

async function listAdminUsers() {
  console.log("🔍 Listing current admin users...");

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, merchant_name, created_at")
      .eq("role", "ADMIN");

    if (error) {
      console.error("❌ Failed to fetch admin users:", error.message);
      process.exit(1);
    }

    if (data.length === 0) {
      console.log("📭 No admin users found");
      return;
    }

    console.log(`📊 Found ${data.length} admin user(s):`);
    data.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.merchant_name || "Admin"}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Created: ${new Date(admin.created_at).toLocaleString()}`);
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

async function deleteAdminUser(userId) {
  console.log(`🗑️  Deleting admin user: ${userId}`);

  try {
    // First delete the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("❌ Failed to delete admin profile:", profileError.message);
      process.exit(1);
    }

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("❌ Failed to delete auth user:", authError.message);
      process.exit(1);
    }

    console.log("✅ Admin user deleted successfully");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    process.exit(1);
  }
}

// CLI interface
function showUsage() {
  console.log("🚀 Admin User Setup Script");
  console.log("\nUsage:");
  console.log("  node scripts/setup-admin.js create <email> <password>");
  console.log("  node scripts/setup-admin.js list");
  console.log("  node scripts/setup-admin.js delete <user-id>");
  console.log("\nExamples:");
  console.log(
    "  node scripts/setup-admin.js create admin@platform.com MySecurePassword123!",
  );
  console.log("  node scripts/setup-admin.js list");
  console.log(
    "  node scripts/setup-admin.js delete 123e4567-e89b-12d3-a456-426614174000",
  );
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help") {
    showUsage();
    return;
  }

  switch (command) {
    case "create":
      if (args.length !== 3) {
        console.error("❌ Missing required arguments: email and password");
        showUsage();
        process.exit(1);
      }
      await createAdminUser(args[1], args[2]);
      break;

    case "list":
      await listAdminUsers();
      break;

    case "delete":
      if (args.length !== 2) {
        console.error("❌ Missing required argument: user-id");
        showUsage();
        process.exit(1);
      }
      await deleteAdminUser(args[1]);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

main().catch(console.error);
