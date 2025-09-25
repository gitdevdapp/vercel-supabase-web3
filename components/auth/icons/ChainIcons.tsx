import React from 'react';

// Ethereum Icon
export function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 256 417" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M127.961 0L125.477 8.455V284.467L127.961 286.946L255.922 212.32L127.961 0Z" />
      <path d="M127.962 0L0 212.32L127.962 286.946V153.461V0Z" />
      <path d="M127.961 310.827L126.386 312.801V415.178L127.961 416.616L256 236.587L127.961 310.827Z" />
      <path d="M127.962 416.616V310.827L0 236.587L127.962 416.616Z" />
      <path d="M127.961 286.946L255.922 212.32L127.961 153.461V286.946Z" />
      <path d="M0 212.32L127.962 286.946V153.461L0 212.32Z" />
    </svg>
  );
}

// Solana Icon
export function SolanaIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 646 646" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M108.53 461.958C111.61 458.887 115.827 457.082 120.314 457.082H603.083C610.776 457.082 614.24 466.395 608.976 471.659L537.463 543.178C534.385 546.249 530.168 548.054 525.681 548.054H42.9114C35.2184 548.054 31.7544 538.741 37.0187 533.477L108.53 461.958Z"
        fill="url(#paint0_linear_7_9)"
      />
      <path
        d="M108.53 42.8853C111.723 39.8142 115.94 38.0088 120.314 38.0088H603.083C610.776 38.0088 614.24 47.3223 608.976 52.5866L537.463 124.105C534.385 127.176 530.168 128.981 525.681 128.981H42.9114C35.2184 128.981 31.7544 119.668 37.0187 114.404L108.53 42.8853Z"
        fill="url(#paint1_linear_7_9)"
      />
      <path
        d="M537.463 252.299C534.385 249.228 530.168 247.423 525.681 247.423H42.9114C35.2184 247.423 31.7544 256.736 37.0187 262L108.53 333.519C111.61 336.59 115.827 338.395 120.314 338.395H603.083C610.776 338.395 614.24 329.082 608.976 323.818L537.463 252.299Z"
        fill="url(#paint2_linear_7_9)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_7_9"
          x1="531.25"
          y1="98.0832"
          x2="120.314"
          y2="631.17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7_9"
          x1="415.255"
          y1="-1.33867e-06"
          x2="120.314"
          y2="421.875"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_7_9"
          x1="473.253"
          y1="49.0416"
          x2="120.314"
          y2="526.522"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Base Chain Icon
export function BaseIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 111 111" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 21.8646 0.239014 49.8282H54.921C54.921 54.2415 54.921 49.8282 54.921 54.2415C54.921 54.2415 54.921 54.2415 54.921 54.2415V54.2415C54.921 54.2415 54.921 54.2415 54.921 54.2415V110.034H54.921Z"
        fill="#0052FF"
      />
    </svg>
  );
}

// GitHub Icon
export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// Generic Wallet Icon (fallback)
export function WalletIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v-2M8 10v2M16 10v2" />
      <path d="M21 9H8a1 1 0 0 1 0-2h13a1 1 0 0 1 1 1v1z" />
      <circle cx="16" cy="13" r="2" />
    </svg>
  );
}
