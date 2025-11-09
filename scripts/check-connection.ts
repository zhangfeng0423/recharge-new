#!/usr/bin/env tsx

/**
 * Database Connection Checker
 *
 * This script helps verify that your Supabase database connection is working properly.
 * Run it with: npx tsx scripts/check-connection.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";

// ANSI colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, "green");
}

function error(message: string) {
  log(`❌ ${message}`, "red");
}

function warning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

function info(message: string) {
  log(`ℹ️  ${message}`, "blue");
}

interface ConnectionTestResult {
  environment: {
    configured: boolean;
    issues: string[];
  };
  database: {
    accessible: boolean;
    tables: Record<string, boolean>;
    error?: string;
  };
  overall: "success" | "warning" | "error";
}

async function checkConnection(): Promise<ConnectionTestResult> {
  const result: ConnectionTestResult = {
    environment: {
      configured: true,
      issues: [],
    },
    database: {
      accessible: false,
      tables: {},
    },
    overall: "success",
  };

  // Check environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const optionalEnvVars = ["SUPABASE_DATABASE_URL", "SUPABASE_POOLER_URL"];

  log("\n🔍 Checking environment variables...", "blue");

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      result.environment.issues.push(`Missing required: ${envVar}`);
      result.environment.configured = false;
    } else {
      success(`${envVar}: ${process.env[envVar]?.substring(0, 20)}...`);
    }
  }

  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      success(`${envVar}: ${process.env[envVar]?.substring(0, 20)}...`);
    } else {
      warning(`${envVar}: Not configured (optional)`);
    }
  }

  if (!result.environment.configured) {
    error("Environment variables not properly configured");
    result.overall = "error";
    return result;
  }

  // Test database connection
  log("\n🗄️  Testing database connection...", "blue");

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (testError) {
      throw testError;
    }

    success("Basic database connection successful");

    // Test table access
    const tables = ["profiles", "games", "skus", "orders"];
    log("\n📊 Testing table access...", "blue");

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        if (error) {
          throw error;
        }

        result.database.tables[table] = true;
        success(`${table}: Accessible (${data?.[0]?.count || 0} rows)`);
      } catch (err) {
        result.database.tables[table] = false;
        error(
          `${table}: Not accessible - ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }

    // Check if all tables are accessible
    const accessibleTables = Object.values(result.database.tables).filter(
      Boolean,
    ).length;
    if (accessibleTables === tables.length) {
      result.database.accessible = true;
      success("All tables accessible");
    } else {
      result.database.accessible = false;
      warning(`Only ${accessibleTables}/${tables.length} tables accessible`);
      result.overall = "warning";
    }
  } catch (err) {
    error(
      `Database connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
    result.database.error =
      err instanceof Error ? err.message : "Unknown error";
    result.overall = "error";
  }

  return result;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    lines.forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !line.startsWith("#")) {
        const [, key, value] = match;
        process.env[key] = value.replace(/^["']|["']$/g, ""); // Remove quotes
      }
    });

    success(`Loaded environment from ${envPath}`);
  } catch (err) {
    warning(`No .env.local file found at ${envPath}`);
    info(
      "Make sure to copy .env.local.example to .env.local and fill in your credentials",
    );
  }
}

function generateNextSteps(result: ConnectionTestResult): string[] {
  const steps: string[] = [];

  if (!result.environment.configured) {
    steps.push("Create .env.local file from .env.local.example");
    steps.push("Fill in your Supabase credentials from the dashboard");
  }

  if (!result.database.accessible) {
    steps.push("Run the database migration in Supabase SQL Editor");
    steps.push(
      "Copy content from supabase/migrations/20250109_001_initial_schema.sql",
    );
    steps.push("Check if your Supabase project is active and not paused");
  }

  const inaccessibleTables = Object.entries(result.database.tables)
    .filter(([_, accessible]) => !accessible)
    .map(([table]) => table);

  if (inaccessibleTables.length > 0) {
    steps.push(
      `Verify ${inaccessibleTables.join(", ")} tables exist in your database`,
    );
  }

  return steps;
}

async function main() {
  log("\n🎮 Game Recharge Platform - Database Connection Checker", "bold");
  log("=".repeat(60), "blue");

  // Load environment variables
  loadEnvFile();

  // Run connection tests
  const result = await checkConnection();

  // Summary
  log("\n📋 Summary", "bold");
  log("-".repeat(30), "blue");

  switch (result.overall) {
    case "success":
      success(
        "All checks passed! Your database connection is working properly.",
      );
      break;
    case "warning":
      warning(
        "Some issues detected. Database is accessible but not fully configured.",
      );
      break;
    case "error":
      error("Connection failed. Please address the issues below.");
      break;
  }

  // Next steps
  const nextSteps = generateNextSteps(result);
  if (nextSteps.length > 0) {
    log("\n🚀 Next Steps", "bold");
    log("-".repeat(30), "blue");
    nextSteps.forEach((step, index) => {
      log(`${index + 1}. ${step}`, "blue");
    });
  } else {
    log(
      "\n✨ You can now start developing your Game Recharge Platform!",
      "green",
    );
  }

  // Test web endpoint
  log("\n🌐 Testing web endpoint...", "blue");
  try {
    // Note: This only works if the development server is running
    const response = await fetch("http://localhost:3000/api/test-connection");
    const data = await response.json();

    if (response.ok) {
      success(`Web API endpoint working: ${data.status}`);
    } else {
      warning(`Web API returned status: ${response.status}`);
    }
  } catch (err) {
    info("Web API test skipped (development server not running)");
    info("Start your dev server with: npm run dev");
  }

  log("\n" + "=".repeat(60), "blue");
  process.exit(result.overall === "error" ? 1 : 0);
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    error(`Script failed: ${error.message}`);
    process.exit(1);
  });
}
