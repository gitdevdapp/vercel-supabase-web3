import { createClient } from "@/lib/supabase/server";
import { createEmailConfirmationServerClient } from "@/lib/supabase/email-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("token_hash");
  const type = searchParams.get("type") || "signup";
  const next = searchParams.get("next") || "/protected/profile";

  console.log("Email confirmation attempt:", {
    code: code ? `${code.substring(0, 15)}...` : null,
    type,
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
    // 🔧 MVP Fix: Detect PKCE tokens and handle them with verifyOtp
    const isPkceToken = code.startsWith('pkce_');
    
    if (isPkceToken) {
      console.log("Detected PKCE token, using verifyOtp method");
      
      // Use email confirmation client with implicit flow
      const supabase = await createEmailConfirmationServerClient();
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: type as 'email' | 'signup' | 'recovery' | 'invite',
      });
      
      if (error) {
        console.error("PKCE token verification failed:", error);
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
        );
      }
      
      if (data.session) {
        console.log("PKCE email confirmation successful via verifyOtp");
        return NextResponse.redirect(`${origin}${next}`);
      }
      
      console.error("No session created after PKCE token verification");
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
      );
      
    } else {
      console.log("Detected non-PKCE token, using exchangeCodeForSession");
      
      // Use regular PKCE client for non-PKCE tokens
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Code exchange failed:", error);
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent('Email confirmation failed: ' + error.message)}`
        );
      }
      
      if (data.session) {
        console.log("Non-PKCE email confirmation successful");
        return NextResponse.redirect(`${origin}${next}`);
      }
      
      console.error("No session created after code exchange");
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Session creation failed')}`
      );
    }
    
  } catch (error) {
    console.error("Unexpected auth confirmation error:", error);
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent('Authentication confirmation failed')}`
    );
  }
}
