// Signature Verification Utilities
// Handles verification of wallet signatures for authentication

import { recoverPersonalSignature } from 'eth-sig-util';
import * as nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { SignatureVerificationResult } from './types';

/**
 * Verify Ethereum wallet signature using personal_sign method
 */
export function verifyEthereumSignature(
  signature: string,
  message: string,
  expectedAddress: string
): SignatureVerificationResult {
  try {
    // Recover the address from the signature
    const recoveredAddress = recoverPersonalSignature({
      data: message,
      sig: signature,
    });

    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

    return {
      isValid,
      recoveredAddress,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
    };
  }
}

/**
 * Verify Solana wallet signature using nacl
 */
export function verifySolanaSignature(
  signature: Uint8Array,
  message: Uint8Array,
  publicKeyString: string
): SignatureVerificationResult {
  try {
    // Parse the public key
    const publicKey = new PublicKey(publicKeyString);
    const publicKeyBytes = publicKey.toBytes();

    // Verify the signature
    const isValid = nacl.sign.detached.verify(message, signature, publicKeyBytes);

    return {
      isValid,
      recoveredAddress: publicKeyString, // For Solana, the "address" is the public key
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Solana signature verification failed',
    };
  }
}

/**
 * Generate a secure nonce for wallet authentication
 */
export function generateNonce(): string {
  // Generate a random string for the nonce
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a message for wallet signing that includes nonce and timestamp
 */
export function createSigningMessage(
  walletAddress: string,
  nonce: string,
  domain: string = 'localhost:3000'
): string {
  const timestamp = new Date().toISOString();
  
  return `Welcome to ${domain}!

This is a secure authentication request.

Wallet: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}

Please sign this message to verify your wallet ownership.`;
}

/**
 * Verify that a nonce hasn't expired
 */
export function isNonceValid(expiresAt: string): boolean {
  return new Date() < new Date(expiresAt);
}

/**
 * Convert hex string to Uint8Array for Solana
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert string to Uint8Array for Solana message signing
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}
