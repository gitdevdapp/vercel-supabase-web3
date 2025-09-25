import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      auth: {
        // TEMPORARY: Use OTP flow for email confirmations until dashboard is fixed
        // Change back to 'pkce' after fixing Supabase dashboard settings
        flowType: 'otp'
      }
    }
  );
}
