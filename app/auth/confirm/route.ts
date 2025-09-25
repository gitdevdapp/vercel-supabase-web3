import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Support both old and new parameter formats
  const token_hash = searchParams.get("token_hash") || searchParams.get("token") || searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || searchParams.get("redirect_to") || "/protected/profile";

  console.log("Auth confirmation attempt:", {
    token_hash: token_hash ? `${token_hash.substring(0, 15)}...(length: ${token_hash.length})` : null,
    type,
    next,
    url: request.url,
    fullUrl: request.url,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  });

  if (token_hash) {
    const supabase = await createClient();

    try {
      // Determine flow type based on token format and type parameter
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
          console.log("PKCE verification successful:", {
            userId: data.user?.id,
            email: data.user?.email,
            sessionId: data.session?.access_token?.substring(0, 10) + '...',
            redirectTo: next
          });
          redirect(next);
        } else {
          console.error("PKCE verification failed - DETAILED:", {
            error: error?.message,
            errorCode: error?.status,
            errorName: error?.name,
            codeLength: code.length,
            codePreview: `${code.substring(0, 10)}...${code.substring(-10)}`,
            fullCode: code, // Temporary for debugging
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            timestamp: new Date().toISOString(),
            details: error,
            userExists: data?.user ? 'yes' : 'no',
            sessionExists: data?.session ? 'yes' : 'no'
          });
          redirect(`/auth/error?error=${encodeURIComponent(
            `${error?.message || 'PKCE verification failed'} (Code: ${error?.status || 'unknown'}, Length: ${code.length})`
          )}`);
        }
      } else if (type) {
        // Standard OTP flow with type parameter
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
      } else if (token_hash.length <= 10 && /^\d+$/.test(token_hash)) {
        // Short numeric code without type - likely authorization code for session exchange
        console.log("Attempting session exchange with authorization code:", {
          tokenLength: token_hash.length,
          tokenValue: token_hash
        });
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash);
        
        if (!error && data.session) {
          console.log("Authorization code exchange successful, redirecting to:", next);
          redirect(next);
        } else {
          console.error("Authorization code exchange failed:", error);
          redirect(`/auth/error?error=${encodeURIComponent(
            error?.message || 'Authorization code verification failed'
          )}`);
        }
      } else {
        // Unknown token format - try PKCE exchange as fallback
        console.log("Unknown token format, attempting PKCE exchange:", {
          tokenLength: token_hash.length,
          tokenStart: token_hash.substring(0, 10),
          hasType: !!type
        });
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash);
        
        if (!error && data.session) {
          console.log("PKCE exchange successful, redirecting to:", next);
          redirect(next);
        } else {
          console.error("PKCE exchange failed:", error);
          redirect(`/auth/error?error=${encodeURIComponent(
            `Token verification failed: ${error?.message || 'Unknown error'}`
          )}`);
        }
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      redirect(`/auth/error?error=${encodeURIComponent('Authentication verification failed')}`);
    }
  }

  // Missing required token parameter
  console.error("Missing auth token:", { 
    token_hash, 
    type, 
    available_params: Object.fromEntries(searchParams.entries()) 
  });
  redirect(`/auth/error?error=${encodeURIComponent('Invalid verification link - missing token parameter')}`);
}
