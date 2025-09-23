import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Support both old and new parameter formats
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || searchParams.get("redirect_to") || "/protected/profile";

  console.log("Auth confirmation attempt:", {
    token_hash: token_hash ? `${token_hash.substring(0, 10)}...` : null,
    type,
    next,
    url: request.url
  });

  if (token_hash && type) {
    const supabase = await createClient();

    try {
      // Handle PKCE flow vs regular OTP flow
      if (token_hash.startsWith('pkce_')) {
        // PKCE flow - exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash);
        
        if (!error && data.session) {
          console.log("PKCE verification successful, redirecting to:", next);
          redirect(next);
        } else {
          console.error("PKCE verification failed:", error);
          redirect(`/auth/error?error=${encodeURIComponent(error?.message || 'PKCE verification failed')}`);
        }
      } else {
        // Standard OTP flow
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });
        
        if (!error) {
          console.log("OTP verification successful, redirecting to:", next);
          redirect(next);
        } else {
          console.error("OTP verification failed:", error);
          redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
        }
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      redirect(`/auth/error?error=${encodeURIComponent('Authentication verification failed')}`);
    }
  }

  // Missing required parameters
  console.error("Missing auth parameters:", { token_hash, type });
  redirect(`/auth/error?error=${encodeURIComponent('Invalid verification link - missing parameters')}`);
}
