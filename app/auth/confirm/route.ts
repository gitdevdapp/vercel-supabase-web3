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
        // PKCE flow - enhanced security for email confirmations
        console.log("PKCE flow - exchanging authorization code for session");
        
        // For PKCE tokens, use the full token (including pkce_ prefix)
        // Supabase handles the code verifier/challenge automatically
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error && data.session) {
          console.log("PKCE verification successful - user authenticated");
          redirect(next);
        } else {
          console.error("PKCE verification failed:", error?.message);
          // Log more details for debugging
          console.error("PKCE error details:", {
            error,
            code: code.substring(0, 15) + '...',
            timestamp: new Date().toISOString()
          });
          redirect(`/auth/error?error=${encodeURIComponent(error?.message || 'PKCE verification failed')}`);
        }
      } else {
        // OTP flow - fallback for older tokens or manual testing
        console.log("OTP flow - verifying email confirmation token");
        
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: code
        });
        
        if (!error) {
          console.log("OTP verification successful - user authenticated");
          redirect(next);
        } else {
          console.error("OTP verification failed:", error?.message);
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
