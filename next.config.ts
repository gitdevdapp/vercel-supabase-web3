import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https: https://img.youtube.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
              "connect-src 'self' https://api.developer.coinbase.com https://api.openai.com wss:",
            ].join("; "),
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/wallet/:path*',
        destination: '/wallets/:path*',
      },
    ];
  },
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
