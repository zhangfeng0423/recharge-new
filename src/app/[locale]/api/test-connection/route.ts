/**
 * Database Connection Test API Route
 *
 * This endpoint tests the database connection and provides detailed status information.
 * It's useful for verifying that the database is properly configured and accessible.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseServerClient,
  getDatabaseHealth,
} from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing database connection...");

    // Check if environment variables are configured
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabasePoolerUrl: !!process.env.SUPABASE_POOLER_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const missingEnvVars = Object.entries(envCheck)
      .filter(([_, isSet]) => !isSet)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
          missing: missingEnvVars,
          configured: envCheck,
        },
        { status: 500 },
      );
    }

    // Test database connectivity
    const health = await getDatabaseHealth();

    // Test basic table access
    const client = getSupabaseServerClient();
    const tableTests = await Promise.allSettled([
      // Test profiles table
      client
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      // Test games table
      client
        .from("games")
        .select("*", { count: "exact", head: true }),
      // Test skus table
      client
        .from("skus")
        .select("*", { count: "exact", head: true }),
      // Test orders table
      client
        .from("orders")
        .select("*", { count: "exact", head: true }),
    ]);

    const results = {
      profiles: tableTests[0].status === "fulfilled" ? "success" : "failed",
      games: tableTests[1].status === "fulfilled" ? "success" : "failed",
      skus: tableTests[2].status === "fulfilled" ? "success" : "failed",
      orders: tableTests[3].status === "fulfilled" ? "success" : "failed",
    };

    const successCount = Object.values(results).filter(
      (r) => r === "success",
    ).length;
    const totalTables = Object.keys(results).length;

    return NextResponse.json({
      status: health.status,
      message: `Database connection test completed`,
      environment: {
        configured: envCheck,
        missing: missingEnvVars.length === 0 ? null : missingEnvVars,
      },
      connectivity: {
        overall: `${successCount}/${totalTables} tables accessible`,
        details: results,
      },
      health: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database connection test failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If a specific table test is requested
    if (body.table) {
      const client = getSupabaseServerClient();
      const { data, error } = await client
        .from(body.table)
        .select("*", { count: "exact", head: true });

      if (error) {
        return NextResponse.json(
          {
            status: "error",
            table: body.table,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        status: "success",
        table: body.table,
        accessible: true,
        count: (data as any)?.count || 0,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Please specify a table to test",
        example: { table: "profiles" },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid request",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
}
