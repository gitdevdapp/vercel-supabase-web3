import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface DiagnosticResult {
  success: boolean;
  timestamp: string;
  environment: {
    hasUrl: boolean;
    hasKey: boolean;
    url: string | null;
    urlFormat: 'valid' | 'invalid' | 'missing';
    keyFormat: 'valid' | 'invalid' | 'missing';
  };
  connectivity: {
    serverClient: {
      canCreate: boolean;
      canGetSession: boolean;
      error?: string;
    };
    networkTest: {
      reachable: boolean;
      responseTime?: number;
      error?: string;
    };
  };
  authCapabilities: {
    canSignUp: boolean;
    canSignIn: boolean;
    canGetUser: boolean;
    errors: string[];
  };
}

export async function GET() {
  const result: DiagnosticResult = {
    success: false,
    timestamp: new Date().toISOString(),
    environment: {
      hasUrl: false,
      hasKey: false,
      url: null,
      urlFormat: 'missing',
      keyFormat: 'missing'
    },
    connectivity: {
      serverClient: {
        canCreate: false,
        canGetSession: false
      },
      networkTest: {
        reachable: false
      }
    },
    authCapabilities: {
      canSignUp: false,
      canSignIn: false,
      canGetUser: false,
      errors: []
    }
  };

  try {
    // Environment variable checks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    result.environment.hasUrl = !!supabaseUrl;
    result.environment.hasKey = !!supabaseKey;
    result.environment.url = supabaseUrl || null;

    // Validate URL format
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl);
        if (url.hostname.includes('supabase.co') || url.hostname.includes('localhost')) {
          result.environment.urlFormat = 'valid';
        } else {
          result.environment.urlFormat = 'invalid';
        }
      } catch {
        result.environment.urlFormat = 'invalid';
      }
    }

    // Validate key format (basic length check)
    if (supabaseKey) {
      if (supabaseKey.length > 100 && (supabaseKey.startsWith('eyJ') || supabaseKey.startsWith('sb-'))) {
        result.environment.keyFormat = 'valid';
      } else {
        result.environment.keyFormat = 'invalid';
      }
    }

    // Network connectivity test
    if (supabaseUrl) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey || '',
            'Authorization': `Bearer ${supabaseKey || ''}`
          }
        });
        const responseTime = Date.now() - startTime;
        
        result.connectivity.networkTest.reachable = response.status < 500;
        result.connectivity.networkTest.responseTime = responseTime;
        
        if (!result.connectivity.networkTest.reachable) {
          result.connectivity.networkTest.error = `HTTP ${response.status}`;
        }
      } catch (error) {
        result.connectivity.networkTest.error = error instanceof Error ? error.message : 'Network error';
      }
    }

    // Server client test
    try {
      const supabase = await createClient();
      result.connectivity.serverClient.canCreate = true;

      try {
        const { error } = await supabase.auth.getSession();
        result.connectivity.serverClient.canGetSession = !error;
        if (error) {
          result.connectivity.serverClient.error = error.message;
        }
      } catch (error) {
        result.connectivity.serverClient.error = error instanceof Error ? error.message : 'Session error';
      }
    } catch (error) {
      result.connectivity.serverClient.error = error instanceof Error ? error.message : 'Client creation error';
    }

    // Auth capabilities test (using test credentials)
    if (result.environment.urlFormat === 'valid' && result.environment.keyFormat === 'valid') {
      try {
        const supabase = await createClient();
        
        // Test sign up capability (with a test email that we know will fail but gives us error info)
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'test-diagnostic@invalid-domain-for-testing.com',
            password: 'test-password-123'
          });
          
          // We expect this to fail, but if it doesn't error completely, auth is working
          result.authCapabilities.canSignUp = true;
          if (signUpError) {
            result.authCapabilities.errors.push(`SignUp: ${signUpError.message}`);
          }
        } catch (error) {
          result.authCapabilities.errors.push(`SignUp Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }

        // Test sign in capability
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'nonexistent@test.com',
            password: 'wrong-password'
          });
          
          // We expect this to fail with "Invalid credentials", which means auth is working
          result.authCapabilities.canSignIn = true;
          if (signInError) {
            result.authCapabilities.errors.push(`SignIn: ${signInError.message}`);
          }
        } catch (error) {
          result.authCapabilities.errors.push(`SignIn Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }

        // Test user retrieval
        try {
          const { error: userError } = await supabase.auth.getUser();
          result.authCapabilities.canGetUser = !userError;
          if (userError) {
            result.authCapabilities.errors.push(`GetUser: ${userError.message}`);
          }
        } catch (error) {
          result.authCapabilities.errors.push(`GetUser Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      } catch (error) {
        result.authCapabilities.errors.push(`Auth Test Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Determine overall success
    result.success = 
      result.environment.urlFormat === 'valid' &&
      result.environment.keyFormat === 'valid' &&
      result.connectivity.networkTest.reachable &&
      result.connectivity.serverClient.canGetSession;

    return NextResponse.json(result, { 
      status: result.success ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    result.authCapabilities.errors.push(`Diagnostic Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    
    return NextResponse.json(result, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}
