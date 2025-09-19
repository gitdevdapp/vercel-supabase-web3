import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // CDP Configuration - all optional for graceful fallback
    CDP_WALLET_SECRET: z.string().optional(),
    CDP_API_KEY_ID: z.string().optional(),
    CDP_API_KEY_SECRET: z.string().optional(),
    NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
    URL: z.string().url().default("http://localhost:3000"),
    
    // AI Gateway - optional for non-AI features
    VERCEL_AI_GATEWAY_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    
    // Supabase Service Role Key (for admin operations)
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    
    // Optional seller address
    SELLER_ADDRESS: z.string().optional(),
  },

  client: {
    // Public environment variables - optional during build, validated at runtime
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_WALLET_NETWORK: z.enum(["base-sepolia", "base"]).default("base-sepolia"),
    NEXT_PUBLIC_ENABLE_CDP_WALLETS: z.string().default("false"),
    NEXT_PUBLIC_ENABLE_AI_CHAT: z.string().default("false"),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    // Server-side variables
    CDP_WALLET_SECRET: process.env.CDP_WALLET_SECRET,
    CDP_API_KEY_ID: process.env.CDP_API_KEY_ID,
    CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET,
    NETWORK: process.env.NETWORK,
    URL: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined,
    VERCEL_AI_GATEWAY_KEY: process.env.VERCEL_AI_GATEWAY_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SELLER_ADDRESS: process.env.SELLER_ADDRESS,
    
    // Client-side variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    NEXT_PUBLIC_WALLET_NETWORK: process.env.NEXT_PUBLIC_WALLET_NETWORK,
    NEXT_PUBLIC_ENABLE_CDP_WALLETS: process.env.NEXT_PUBLIC_ENABLE_CDP_WALLETS,
    NEXT_PUBLIC_ENABLE_AI_CHAT: process.env.NEXT_PUBLIC_ENABLE_AI_CHAT,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === 'production',
});
