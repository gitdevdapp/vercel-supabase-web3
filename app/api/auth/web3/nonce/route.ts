// Web3 Authentication - Nonce Generation
// Generates a secure nonce for wallet signature verification

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateNonce, createSigningMessage } from '@/lib/web3/signature-verification';
import { NonceRequest, NonceResponse, WalletType } from '@/lib/web3/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: NonceRequest = await request.json();
    const { walletAddress, walletType } = body;

    // Validate input
    if (!walletAddress || !walletType) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, walletType' },
        { status: 400 }
      );
    }

    // Validate wallet type
    const validWalletTypes: WalletType[] = ['ethereum', 'solana', 'base'];
    if (!validWalletTypes.includes(walletType)) {
      return NextResponse.json(
        { error: 'Invalid wallet type. Must be ethereum, solana, or base' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic validation)
    if (walletType === 'solana') {
      // Solana addresses are base58 encoded, roughly 44 characters
      if (walletAddress.length < 32 || walletAddress.length > 44) {
        return NextResponse.json(
          { error: 'Invalid Solana wallet address format' },
          { status: 400 }
        );
      }
    } else {
      // Ethereum/Base addresses should be 42 characters starting with 0x
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return NextResponse.json(
          { error: 'Invalid Ethereum/Base wallet address format' },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();

    // Generate nonce and message
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const domain = request.headers.get('host') || 'localhost:3000';
    const message = createSigningMessage(walletAddress, nonce, domain);

    // Store nonce in database (upsert to handle multiple attempts)
    const { error: dbError } = await supabase
      .from('wallet_auth')
      .upsert({
        wallet_address: walletAddress,
        wallet_type: walletType,
        nonce,
        nonce_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      });

    if (dbError) {
      console.error('Database error storing nonce:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate nonce' },
        { status: 500 }
      );
    }

    // Return nonce and message for signing
    const response: NonceResponse = {
      nonce,
      message,
      expiresAt: expiresAt.toISOString()
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in nonce generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
