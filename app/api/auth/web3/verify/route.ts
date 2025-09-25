// Web3 Authentication - Signature Verification and User Creation
// Verifies wallet signature and creates/authenticates user

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  verifyEthereumSignature, 
  verifySolanaSignature, 
  isNonceValid,
  hexToUint8Array,
  stringToUint8Array
} from '@/lib/web3/signature-verification';
import { Web3AuthRequest, Web3AuthResponse } from '@/lib/web3/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: Web3AuthRequest = await request.json();
    const { walletAddress, walletType, signature, message, nonce } = body;

    // Validate required fields
    if (!walletAddress || !walletType || !signature || !message || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify nonce exists and hasn't expired
    const { data: walletAuth, error: nonceError } = await supabase
      .from('wallet_auth')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('nonce', nonce)
      .single();

    if (nonceError || !walletAuth) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      );
    }

    // Check if nonce has expired
    if (!walletAuth.nonce_expires_at || !isNonceValid(walletAuth.nonce_expires_at)) {
      return NextResponse.json(
        { error: 'Nonce has expired' },
        { status: 400 }
      );
    }

    // Verify signature based on wallet type
    let verificationResult;
    
    if (walletType === 'solana') {
      try {
        const signatureBytes = hexToUint8Array(signature);
        const messageBytes = stringToUint8Array(message);
        verificationResult = verifySolanaSignature(signatureBytes, messageBytes, walletAddress);
      } catch {
        return NextResponse.json(
          { error: 'Invalid Solana signature format' },
          { status: 400 }
        );
      }
    } else {
      // Ethereum and Base use the same signature verification
      verificationResult = verifyEthereumSignature(signature, message, walletAddress);
    }

    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if user already exists with this wallet
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let userId: string;

    if (existingProfile) {
      // User exists, get their auth user
      userId = existingProfile.id;
    } else {
      // Create new user with wallet authentication
      const userEmail = `${walletAddress}@wallet.local`; // Temporary email format
      
      const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: userEmail,
        email_confirm: true, // Auto-confirm since wallet is verified
        user_metadata: {
          wallet_address: walletAddress,
          wallet_type: walletType,
          auth_method: 'web3'
        }
      });

      if (signUpError || !authUser.user) {
        console.error('Error creating user:', signUpError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = authUser.user.id;

      // Update profile with wallet info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          wallet_type: walletType,
          username: `${walletType}-${walletAddress.slice(-8)}` // Generate username
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Continue anyway - profile will be created by trigger
      }
    }

    // Mark wallet as verified
    const { error: verifyError } = await supabase
      .from('wallet_auth')
      .update({
        verified_at: new Date().toISOString(),
        nonce: null, // Clear nonce after use
        nonce_expires_at: null
      })
      .eq('wallet_address', walletAddress);

    if (verifyError) {
      console.error('Error marking wallet as verified:', verifyError);
    }

    // For Web3 auth, we'll generate a magic link for the user to auto-login
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `${walletAddress}@wallet.local`
    });

    if (linkError || !linkData) {
      console.error('Error generating magic link:', linkError);
      return NextResponse.json(
        { error: 'Authentication successful but session creation failed' },
        { status: 500 }
      );
    }

    // Return successful authentication with the magic link for auto-login
    const response: Web3AuthResponse = {
      success: true,
      session: {
        access_token: linkData.properties.action_link, // Magic link for auto-login
        refresh_token: 'web3_redirect_required',
        user: {
          id: userId,
          wallet_address: walletAddress
        }
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in signature verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
