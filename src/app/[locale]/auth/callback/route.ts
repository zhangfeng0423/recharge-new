import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // Create a Supabase client for the callback
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        cookies: {
          get(name) {
            return cookies().get(name)?.value;
          },
          set(name, value, options) {
            cookies().set(name, value, { ...options, httpOnly: true });
          },
          remove(name, options) {
            cookies().delete(name);
          },
        },
      },
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(error.message)}`,
      );
    }

    if (data.user) {
      // Check if user profile exists, create if not
      const serverClient = createSupabaseServerClient();
      const { data: profile, error: profileError } = await serverClient
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create one with default USER role
        const profileData = {
          id: data.user.id,
          role: "USER" as const,
          merchant_name: null,
        };

        const { error: createError } = await (serverClient as any)
          .from("profiles")
          .insert(profileData);

        if (createError) {
          console.error("Profile creation error:", createError);
          return NextResponse.redirect(
            `${origin}/auth?error=Failed to create user profile`,
          );
        }
      }

      // Successfully authenticated and profile exists, redirect to intended page
      const redirectUrl = next === "/" ? "/dashboard" : next;
      return NextResponse.redirect(`${origin}${redirectUrl}?welcome=true`);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth?error=Authentication failed`);
}
