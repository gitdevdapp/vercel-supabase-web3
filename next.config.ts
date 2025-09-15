import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com; img-src 'self' https://img.youtube.com data: blob:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
