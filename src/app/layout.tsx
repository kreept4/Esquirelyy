import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import SmallScreenNotice from '@/components/layout/SmallScreenNotice'

/**
 * The live host, and the base every relative metadata URL is resolved against.
 *
 * Without metadataBase, Next resolves OG and Twitter image paths against
 * localhost at build time and warns; the tags ship pointing at a machine nobody
 * else can reach, so link previews render blank. It has to be an absolute URL
 * known at build, which is why it is a constant here and not read from a
 * request.
 *
 * Preview deployments should describe themselves rather than production, so
 * NEXT_PUBLIC_SITE_URL wins where it is set. Production leaves it unset or sets
 * it to the same value.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://esquirely.com.ng'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  alternates: { canonical: '/' },
  title: {
    default: 'Esquirely | Nigeria\'s Legal Career Platform',
    template: '%s | Esquirely',
  },
  description: 'The definitive platform for legal jobs, internships, scholarships, and opportunities across Nigeria\'s top law firms, courts, and institutions.',
  keywords: ['legal jobs Nigeria', 'law firm internships', 'Nigerian bar', 'legal careers', 'SAN chambers', 'law scholarships Nigeria'],
  openGraph: {
    title: 'Esquirely | Nigeria\'s Legal Career Platform',
    description: 'Jobs, internships, scholarships, and opportunities for Nigerian legal professionals.',
    url: SITE,
    siteName: 'Esquirely',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Esquirely',
    description: 'Nigeria\'s premier legal career platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        {children}
        <SmallScreenNotice />
      </body>
    </html>
  )
}
