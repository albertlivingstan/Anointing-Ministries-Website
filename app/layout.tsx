import type {Metadata, Viewport} from 'next';
import '../src/style.css';

export const viewport: Viewport = {
  themeColor: '#101827',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Anointing Ministries — Bible, Worship & Community',
  description: 'Read the Tamil and English Bible, worship together, and share encouragement with Anointing Ministries, Coimbatore.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/images/anointing-logo.jpg', apple: '/icons/icon-192.png' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#101827"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
      </head>
      <body>{children}</body>
    </html>
  );
}
