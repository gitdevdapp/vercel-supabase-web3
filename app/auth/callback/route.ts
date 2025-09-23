import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/protected/profile";

  console.log("Auth callback attempt:", {
    code: code ? `${code.substring(0, 10)}...` : null,
    next,
    url: request.url
  });

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        console.log("Callback verification successful, redirecting to:", next);
        // Successfully authenticated, redirect to intended page
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error("Callback verification failed:", error);
        // Auth failed, redirect to error page
        return NextResponse.redirect(
          `${origin}/auth/error?error=${encodeURIComponent(error.message)}`
        );
      }
    } catch (error) {
      console.error("Unexpected callback error:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent('Authentication callback failed')}`
      );
    }
  }

  // No code provided, redirect to error
  console.error("Missing code parameter in callback");
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent('No authorization code provided')}`
  );
}
