/**
 * Email Confirmation Client - Uses Implicit Flow for PKCE Token Compatibility
 * 
 * This client is specifically designed to handle email confirmation tokens
 * that may be in PKCE format but lack the required code verifier.
 * 
 * Uses implicit flow instead of PKCE to avoid the "both auth code and code verifier
 * should be non-empty" error that occurs with email confirmation links.
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

export const createEmailConfirmationClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit',    // 🔧 Use implicit flow for email confirmations
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'sb-email-confirmation', // Separate storage to avoid conflicts
    },
  });

/**
 * Server-side email confirmation client (uses cookies)
 */
export async function createEmailConfirmationServerClient() {
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');
  
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component - ignore cookie setting errors
        }
      },
    },
    auth: {
      flowType: 'implicit',  // 🔧 Use implicit flow for email confirmations
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

