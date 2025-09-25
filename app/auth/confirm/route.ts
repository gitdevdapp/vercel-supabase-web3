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
    token_hash: token_hash ? `${token_hash.substring(0, 15)}...(length: ${token_hash.length})` : null,
    type,
    next,
    url: request.url,
    fullUrl: request.url
  });

  if (token_hash && type) {
    const supabase = await createClient();

    try {
      // Handle PKCE flow vs regular OTP flow
      if (token_hash.startsWith('pkce_')) {
        // PKCE flow - exchange code for session (strip pkce_ prefix)
        const code = token_hash.substring(5); // Remove 'pkce_' prefix
        
        console.log("PKCE flow detected:", {
          originalTokenLength: token_hash.length,
          originalToken: `${token_hash.substring(0, 15)}...`,
          strippedCodeLength: code.length,
          strippedCode: `${code.substring(0, 15)}...`,
          type,
          expectedMinLength: 40 // PKCE codes should be at least 43-128 chars
        });
        
        // Check if PKCE code seems too short (indicating truncation)
        if (code.length < 40) {
          console.error("PKCE code appears truncated:", {
            actualLength: code.length,
            expectedMinLength: 40,
            possibleCause: "Email template URL truncation or configuration issue"
          });
          redirect(`/auth/error?error=${encodeURIComponent(
            `Invalid verification link - PKCE code too short (${code.length} chars). This indicates an email configuration issue.`
          )}`);
        }
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error && data.session) {
          console.log("PKCE verification successful, redirecting to:", next);
          redirect(next);
        } else {
          console.error("PKCE verification failed:", {
            error: error?.message,
            status: error?.status,
            codeLength: code.length,
            details: error
          });
          redirect(`/auth/error?error=${encodeURIComponent(
            error?.message || `PKCE verification failed - code length: ${code.length}`
          )}`);
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
