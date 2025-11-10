import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.userId || !body.email) {
      return NextResponse.json(
        { success: false, message: "User ID and email are required" },
        { status: 400 },
      );
    }

    // Use admin client for profile operations
    const supabase = createSupabaseAdminClient();

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", body.userId)
      .single();

    // If profile doesn't exist, determine appropriate role based on email
    if (profileError && profileError.code === "PGRST116") {
      console.log(
        "Profile not found, determining role for user:",
        body.userId,
        body.email,
      );

      // Determine role based on email pattern
      let userRole = "USER";
      if (body.email && body.email.includes("merchant")) {
        userRole = "MERCHANT";
        console.log("Detected merchant user based on email:", body.email);
      } else if (body.email && body.email.includes("admin")) {
        userRole = "ADMIN";
        console.log("Detected admin user based on email:", body.email);
      } else {
        console.log("Defaulting to USER role for:", body.email);
      }

      const { error: createError } = await (supabase as any)
        .from("profiles")
        .insert({
          id: body.userId,
          role: userRole,
          merchant_name:
            userRole === "MERCHANT" ? body.email.split("@")[0] : null,
        });

      if (createError) {
        console.error("Profile creation error:", createError);
        return NextResponse.json(
          { success: false, message: "Failed to create user profile" },
          { status: 500 },
        );
      }

      console.log("Profile created successfully with role:", userRole);
      return NextResponse.json({
        success: true,
        message: "Profile created successfully",
        role: userRole,
      });
    }

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 },
      );
    }

    console.log("Profile found with role:", (profile as any).role);
    return NextResponse.json({
      success: true,
      message: "Profile already exists",
      role: (profile as any).role,
    });
  } catch (error) {
    console.error("Ensure profile API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
