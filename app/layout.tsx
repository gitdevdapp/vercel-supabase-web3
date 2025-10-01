import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "DevDapp - Deploy Decentralized Applications Fast",
  description: "The fastest way to deploy decentralized applications with enterprise-grade security. Build, test, and launch Dapps with confidence using modern web technologies.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  keywords: ["Dapp", "decentralized applications", "web3", "blockchain", "ethereum", "deployment platform"],
  authors: [{ name: "DevDapp" }],
  creator: "DevDapp",
  publisher: "DevDapp",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: defaultUrl,
    title: "DevDapp - Deploy Decentralized Applications Fast",
    description: "The fastest way to deploy decentralized applications with enterprise-grade security. Build, test, and launch Dapps with confidence using modern web technologies.",
    siteName: "DevDapp",
    images: [
      {
        url: `${defaultUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "DevDapp - Decentralized Application Platform",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DevDapp - Deploy Decentralized Applications Fast",
    description: "The fastest way to deploy decentralized applications with enterprise-grade security.",
    images: [`${defaultUrl}/twitter-image.png`],
    creator: "@devdappstore",
  },
  verification: {
    google: "verification-code-here",
  },
  alternates: {
    canonical: defaultUrl,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
