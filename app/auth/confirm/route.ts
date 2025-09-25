import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("token_hash");
  const next = searchParams.get("next") || "/protected/profile";

  console.log("Email confirmation attempt:", {
    code: code ? `${code.substring(0, 15)}...` : null,
    next,
    url: request.url
  });

  if (!code) {
    console.error("Missing authorization code");
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Missing authorization code')}`
    );
  }

  try {
    const supabase = await createClient();
    
    // PKCE-Only: Use exchangeCodeForSession exclusively
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("PKCE verification failed:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
      );
    }
    
    if (data.session) {
      console.log("Email confirmation successful");
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error("No session created after PKCE exchange");
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
    );
    
  } catch (error) {
    console.error("Unexpected auth confirmation error:", error);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Authentication confirmation failed')}`
    );
  }
}
