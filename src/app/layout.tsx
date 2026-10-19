import type { Metadata, Viewport } from 'next';
import { Toaster } from '../components/Toaster';
import '../styles.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://streetcraft.tomesphere.in';

export const metadata: Metadata = {
  title: {
    default: 'StreetCraft — A Growth Engine for Physical Businesses',
    template: '%s | StreetCraft',
  },
  referrer: 'strict-origin-when-cross-origin',
  description:
    'StreetCraft — Turn one business opportunity into everything customers need to see. Google, Instagram, WhatsApp, and your counter, prepared together for physical businesses.',
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  keywords: [
    'local marketing',
    'retail marketing',
    'store promotions',
    'cafe marketing',
    'restaurant promotions',
    'whatsapp broadcast',
    'google business profile',
    'instagram reels marketing',
    'counter card print',
    'growth engine',
  ],
  authors: [{ name: 'StreetCraft Team' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'StreetCraft — A Growth Engine for Physical Businesses',
    description:
      'Turn one business opportunity into everything customers need to see across Google, Instagram, WhatsApp, and in-store counter print.',
    url: appUrl,
    type: 'website',
    siteName: 'StreetCraft',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetCraft — A Growth Engine for Physical Businesses',
    description:
      'Turn one business opportunity into everything customers need to see across Google, Instagram, WhatsApp, and in-store counter print.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAFAF8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="paper" suppressHydrationWarning>
      <head>
        {/* Synchronous theme initialization to eliminate theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('streetcraft-theme');
                  if (saved && (saved === 'paper' || saved === 'paper-dark' || saved === 'high-contrast')) {
                    document.documentElement.setAttribute('data-theme', saved);
                  }
                } catch(e) {
                  console.warn('Unable to access localStorage for theme preference:', e);
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-container">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
