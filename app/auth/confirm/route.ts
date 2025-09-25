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
      // TEMPORARY WORKAROUND: Force OTP flow until Supabase dashboard is fixed
      // Remove this block once PKCE is disabled in Supabase dashboard
      if (code.startsWith('pkce_')) {
        console.log("WORKAROUND: Converting PKCE token to OTP flow");
        // For now, strip the pkce_ prefix and treat as OTP token
        const otpToken = code.replace('pkce_', '');
        console.log("Converted token for OTP verification:", otpToken.substring(0, 10) + '...');

        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: otpToken
        });

        if (!error) {
          console.log("OTP workaround successful - user authenticated");
          redirect(next);
          return;
        } else {
          console.error("OTP workaround failed, trying PKCE as fallback:", error?.message);
        }
      }

      // Try OTP flow first (this should be the primary method for email confirmations)
      console.log("OTP flow - verifying email confirmation token");

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: code
      });

      if (!error) {
        console.log("OTP verification successful - user authenticated");
        redirect(next);
      } else {
        // If OTP fails, try PKCE as fallback
        console.log("OTP failed, trying PKCE flow as fallback");
        console.log("PKCE flow - exchanging authorization code for session");

        const { data, pkceError } = await supabase.auth.exchangeCodeForSession(code);

        if (!pkceError && data.session) {
          console.log("PKCE verification successful - user authenticated");
          redirect(next);
        } else {
          console.error("Both OTP and PKCE verification failed");
          console.error("OTP error:", error?.message);
          console.error("PKCE error:", pkceError?.message);
          redirect(`/auth/error?error=${encodeURIComponent('Email verification failed - please try again or contact support')}`);
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
