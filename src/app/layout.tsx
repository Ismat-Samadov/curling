import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CurlMaster — Browser Curling Game',
  description:
    'A full browser curling game. Slide stones on ice, curl around opponents, and score big! Built with Next.js, TypeScript, and Tailwind CSS.',
  keywords: ['curling', 'game', 'browser game', 'next.js', 'html5 canvas'],
  openGraph: {
    title: 'CurlMaster',
    description: 'Slide · Curl · Score — a browser curling game',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
