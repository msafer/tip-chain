import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';

// Dynamic import for providers to prevent SSR issues
const Providers = dynamic(() => import('./providers').then(mod => ({ default: mod.Providers })), {
  ssr: false,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tip Chain - Decentralized Tipping on Farcaster',
  description: 'Send cryptocurrency tips seamlessly through Farcaster frames on Base and Optimism networks.',
  keywords: [
    'tipping',
    'cryptocurrency',
    'farcaster',
    'frames',
    'base',
    'optimism',
    'ethereum',
    'web3',
  ],
  authors: [{ name: 'Tip Chain Team' }],
  creator: 'Tip Chain',
  publisher: 'Tip Chain',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tip-chain.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tip Chain - Decentralized Tipping Platform',
    description: 'Send cryptocurrency tips seamlessly through Farcaster frames on Base and Optimism networks.',
    url: 'https://tip-chain.vercel.app',
    siteName: 'Tip Chain',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tip Chain - Decentralized Tipping Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tip Chain - Decentralized Tipping Platform',
    description: 'Send cryptocurrency tips seamlessly through Farcaster frames.',
    images: ['/og-image.jpg'],
    creator: '@tipchain',
  },
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
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
