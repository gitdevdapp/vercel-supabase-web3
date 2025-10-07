'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Emergency OAuth Code Handler
 * 
 * This component handles OAuth codes that mistakenly land on the homepage
 * due to misconfigured redirect URLs. It should NOT be needed after proper
 * configuration, but acts as a safety net.
 * 
 * Why this exists:
 * - If Supabase redirect URLs don't match exactly, users may land on homepage with ?code=
 * - This extracts the code and exchanges it for a session
 * - Then redirects to the intended destination
 * 
 * This is a TEMPORARY MITIGATION. The real fix is proper environment variables.
 */
export function OAuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);
  
  useEffect(() => {
    // Prevent double-processing in development mode (React StrictMode)
    if (hasProcessed.current) return;
    
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Handle OAuth errors
    if (error) {
      console.warn('⚠️ OAuth error detected on homepage:', error, errorDescription);
      hasProcessed.current = true;
      router.push(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }
    
    // Handle OAuth code on homepage (should not happen with proper config)
    if (code) {
      console.warn('⚠️ OAuth code detected on homepage - this indicates misconfiguration');
      console.log('Code:', code.substring(0, 10) + '...');
      console.log('Attempting emergency recovery...');
      
      hasProcessed.current = true;
      
      const supabase = createClient();
      
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error: exchangeError }) => {
          if (!exchangeError && data?.session) {
            console.log('✅ Emergency code exchange successful');
            console.log('User ID:', data.user?.id);
            console.log('Provider:', data.user?.app_metadata?.provider);
            console.log('Redirecting to profile...');
            
            // Success - redirect to profile
            router.push('/protected/profile');
          } else {
            console.error('❌ Emergency code exchange failed:', exchangeError?.message);
            
            // Provide helpful error message
            let userMessage = exchangeError?.message || 'Authentication failed';
            if (userMessage.includes('expired')) {
              userMessage = 'Authorization code has expired. Please try signing in again.';
            } else if (userMessage.includes('invalid')) {
              userMessage = 'Invalid authorization code. Please try signing in again.';
            } else if (userMessage.includes('already used')) {
              userMessage = 'Authorization code was already used. Please try signing in again.';
            }
            
            router.push(`/auth/error?error=${encodeURIComponent(userMessage)}`);
          }
        })
        .catch((err) => {
          console.error('❌ Unexpected error during emergency code exchange:', err);
          const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
          router.push(`/auth/error?error=${encodeURIComponent(errorMessage)}`);
        });
    }
  }, [searchParams, router]);
  
  return null;
}


