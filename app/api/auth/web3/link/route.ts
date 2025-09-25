// Web3 Authentication - Wallet Linking
// Links a wallet to an existing authenticated user account

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  verifyEthereumSignature, 
  verifySolanaSignature, 
  isNonceValid,
  hexToUint8Array,
  stringToUint8Array
} from '@/lib/web3/signature-verification';
import { WalletLinkRequest } from '@/lib/web3/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: WalletLinkRequest = await request.json();
    const { walletAddress, walletType, signature, message, nonce } = body;

    // Validate required fields
    if (!walletAddress || !walletType || !signature || !message || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    // Check if wallet is already linked to another user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, wallet_address')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingProfile && existingProfile.id !== user.id) {
      return NextResponse.json(
        { error: 'Wallet is already linked to another account' },
        { status: 409 }
      );
    }

    // Link wallet to current user's profile
    const { error: linkError } = await supabase
      .from('profiles')
      .update({
        wallet_address: walletAddress,
        wallet_type: walletType
      })
      .eq('id', user.id);

    if (linkError) {
      console.error('Error linking wallet to profile:', linkError);
      return NextResponse.json(
        { error: 'Failed to link wallet to account' },
        { status: 500 }
      );
    }

    // Update wallet auth record
    const { error: updateError } = await supabase
      .from('wallet_auth')
      .update({
        user_id: user.id,
        verified_at: new Date().toISOString(),
        nonce: null, // Clear nonce after use
        nonce_expires_at: null
      })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Error updating wallet auth:', updateError);
      // Continue anyway - the main linking is done
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Wallet successfully linked to account',
        wallet_address: walletAddress,
        wallet_type: walletType
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in wallet linking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
