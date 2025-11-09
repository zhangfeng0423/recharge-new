import { getSupabaseClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated, redirect to the intended page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth?error=Authentication failed`);
}