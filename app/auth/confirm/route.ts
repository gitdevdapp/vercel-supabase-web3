import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract parameters - support multiple formats
  const code = searchParams.get("code") || searchParams.get("token_hash") || searchParams.get("token");
  const type = (searchParams.get("type") as EmailOtpType) || 'signup'; // Default to signup
  const next = searchParams.get("next") || searchParams.get("redirect_to") || "/protected/profile";

  console.log("Email confirmation attempt:", {
    code: code ? `${code.substring(0, 10)}...(length: ${code.length})` : null,
    type,
    next,
    url: request.url,
    timestamp: new Date().toISOString()
  });

  if (code) {
    const supabase = await createClient();

    try {
      if (code.startsWith('pkce_')) {
        // PKCE flow - handle long authorization codes
        const authCode = code.substring(5); // Remove 'pkce_' prefix
        
        console.log("PKCE flow - exchanging authorization code");
        const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
        
        if (!error && data.session) {
          console.log("PKCE verification successful");
          redirect(next);
        } else {
          console.error("PKCE verification failed:", error?.message);
          redirect(`/auth/error?error=${encodeURIComponent(error?.message || 'PKCE verification failed')}`);
        }
      } else {
        // OTP flow - the winning solution for email confirmation
        console.log("OTP flow - verifying email confirmation token");
        
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: code  // Use token_hash parameter (the standard approach)
        });
        
        if (!error) {
          console.log("Email confirmation successful, auto-login complete");
          redirect(next);
        } else {
          console.error("Email confirmation failed:", error?.message);
          redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
        }
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      redirect(`/auth/error?error=${encodeURIComponent('Authentication verification failed')}`);
    }
  }

  // Missing confirmation code
  console.error("Missing confirmation code:", { 
    available_params: Object.fromEntries(searchParams.entries()) 
  });
  redirect(`/auth/error?error=${encodeURIComponent('Invalid verification link - missing confirmation code')}`);
}
