import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: {
    default: 'Esquirely — Nigeria\'s Legal Career Platform',
    template: '%s | Esquirely',
  },
  description: 'The definitive platform for legal jobs, internships, scholarships, and opportunities across Nigeria\'s top law firms, courts, and institutions.',
  keywords: ['legal jobs Nigeria', 'law firm internships', 'Nigerian bar', 'legal careers', 'SAN chambers', 'law scholarships Nigeria'],
  openGraph: {
    title: 'Esquirely — Nigeria\'s Legal Career Platform',
    description: 'Jobs, internships, scholarships, and opportunities for Nigerian legal professionals.',
    url: 'https://esquirely.ng',
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
