import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import './globals.css';

// Vendored so a build never reaches Google Fonts. See src/fonts/README.md.
const ibmPlexSansArabic = localFont({
  src: [
    { path: '../fonts/IBMPlexSansArabic-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-ibm-plex-sans-arabic',
});

export const metadata: Metadata = {
  title: 'Music & Education Center',
  description: 'Center management system',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={ibmPlexSansArabic.variable}>
      <body>{children}</body>
    </html>
  );
}
