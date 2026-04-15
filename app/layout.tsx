import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleTagManager } from '@next/third-parties/google'
import ClarityInit from '@/components/clarity-init'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'The Equalizer | Free SEO Audit Tool by Rebel Marketer',
  description: 'The Equalizer is a free SEO audit tool by Rebel Marketer. Analyse any website for technical SEO issues, meta tags, schema markup, social previews, robots.txt, sitemap, and page speed.',
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
        {children}
        <Analytics />
        <ClarityInit />
        <GoogleTagManager gtmId="GTM-PSMDNPCN" />
      </body>
    </html>
  )
}
