import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/supabase-types";
import {
  createSupabaseAdminClient,
  createSupabaseClientForServerActions,
} from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Create a Supabase client for the API route that can set cookies
    const supabase = await createSupabaseClientForServerActions();

    // Attempt to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      console.error("Login error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Login failed" },
        { status: 401 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, message: "No user data returned" },
        { status: 401 },
      );
    }

    // Use admin client for profile operations
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", data.user.id as string)
      .single();

    // If profile doesn't exist, create one with default USER role
    if (profileError && profileError.code === "PGRST116") {
      console.log(
        "Profile not found, creating default profile for user:",
        data.user.id,
      );
      const { error: createError } = await (adminClient as any)
        .from("profiles")
        .insert({
          id: data.user.id,
          role: "USER" as const,
          merchant_name: null,
        });

      if (createError) {
        console.error("Profile creation error:", createError);
        return NextResponse.json(
          { success: false, message: "Failed to create user profile" },
          { status: 500 },
        );
      }

      // Return success with default USER role
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: "USER" as const,
        },
      });
    }

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 },
      );
    }

    // Return success with user role
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: (profile as any).role as "USER" | "MERCHANT" | "ADMIN",
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
