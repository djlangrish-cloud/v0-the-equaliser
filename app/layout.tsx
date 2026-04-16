import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
import ClarityInit from '@/components/clarity-init'
import { CookieBanner } from '@/components/cookie-banner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'The Equalizer | SEO Audit Tool by Rebel Marketer',
  description: 'The Equalizer by Rebel Marketer. Enter any URL and see exactly what\'s holding it back — technical SEO, meta tags, schema markup, social previews, robots.txt, sitemap, and page speed.',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* Set GA consent to denied by default before GTM loads */}
        <Script id="gtm-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            wait_for_update: 500
          });
        `}</Script>
        {children}
        <Analytics />
        <ClarityInit />
        <CookieBanner />
        <GoogleTagManager gtmId="GTM-PSMDNPCN" />
      </body>
    </html>
  )
}
