import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import SmallScreenNotice from '@/components/layout/SmallScreenNotice'
import ReferralCapture from '@/components/features/ReferralCapture'
import JsonLd, { FOUNDERS } from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/site-url'

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
const SITE = SITE_URL

/**
 * ⚠ THERE IS NO `alternates.canonical` HERE, AND IT MUST NOT COME BACK.
 *
 * It used to read `alternates: { canonical: '/' }`, and App Router metadata is
 * inherited, so every page that did not override it shipped
 * <link rel="canonical" href="https://esquirely.com.ng/">. Only the firm
 * profiles overrode it. Eight public pages — the firms directory among them —
 * were telling Google they were duplicates of the homepage, which is an
 * instruction to drop them from the index and credit their content to a URL
 * that does not contain it.
 *
 * A canonical is per-page by definition, so it belongs on the page. Every
 * public route now sets its own, and the homepage sets one in app/page.tsx like
 * any other. Making this line dynamic would work and would be worse: the next
 * person to add a route would inherit a value they never wrote.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
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
  /**
   * ⚠ RASTER ICONS AT STABLE URLS, AND BOTH HALVES OF THAT MATTER.
   *
   * The only icon here was src/app/icon.svg through Next's file convention,
   * which emits href="/icon.svg?icon.<hash>.svg". Google's favicon rules say in
   * as many words that "the favicon URL must be stable", and a content hash
   * moves it on every edit to the mark. Google recrawls favicons on a schedule
   * of days to weeks, so a moving URL is a favicon it never settles on. Files in
   * /public carry no hash.
   *
   * And the documented format list is raster; SVG is not named. It may well
   * work, and this is not the place to find out, because the failure is
   * invisible from here: the result simply shows a globe.
   *
   * The SVG stays FIRST for browsers, which prefer it and scale it properly.
   * The PNGs are what a crawler is offered. apple-touch-icon is listed because
   * it is one of the three rel values Google names as a favicon source, so it
   * is a second chance at the same job rather than an iOS-only nicety.
   *
   * All three are written by scripts/make-logo-pngs.mjs from the same measured
   * geometry as the SVG. Re-run it if the mark changes.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

/**
 * Who we are, in the one format a machine reads.
 *
 * Two blocks, and they do different jobs. `Organization` is the entity record:
 * it is what a knowledge panel is built from, and it is the only lever available
 * against the problem that "Esquirely" sits one letter from Esquire, a global
 * magazine with enormous authority. You do not out-rank that with keywords, you
 * out-identify it, by stating the entity consistently and pointing `sameAs` at
 * every profile that also describes it. `WebSite` is the site record, and its
 * `inLanguage` and `publisher` link are what tie individual pages back here.
 *
 * ⚠ `sameAs` IS DELIBERATELY EMPTY AND IS THE NEXT THING TO FILL. Its value
 * comes entirely from corroboration: two or three independent profiles naming
 * the same entity is what turns a claim into a fact. A LinkedIn company page is
 * the highest-value single entry for this audience. Add them as they exist
 * rather than listing profiles that do not, since a `sameAs` pointing at a 404
 * is worse than a short list.
 */
const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'Esquirely',
  url: SITE,
  description:
    'Nigeria\'s legal careers platform: an independent directory of Nigerian law firms, verified job and internship listings, and scholarship deadlines.',
  areaServed: { '@type': 'Country', name: 'Nigeria' },
  knowsLanguage: 'en-NG',
  /**
   * ⚠ THIS IS THE PROPERTY THE SITE LOGO IN SEARCH IS BUILT FROM, and it was
   * missing entirely. Everything else in this block described the entity and
   * then declined to say what it looks like, so there was nothing for Google to
   * show and the result rendered with no mark at all.
   *
   * 512, against a documented minimum of 112. Big enough that a consumer
   * scaling down never invents detail, and the file is 2KB because the mark is
   * four rectangles.
   *
   * Opaque on its own amber ground, which is what "make sure the image looks
   * how you intend it to look on a purely white background" asks for. A
   * transparent version of this mark is dark ink floating on white, which is
   * not the logo.
   */
  logo: `${SITE}/logo.png`,
  /**
   * ⚠ WHO FOUNDED THIS, WHICH THIS BLOCK PREVIOUSLY DECLINED TO SAY.
   *
   * Everything above describes what Esquirely is, where it operates and what it
   * looks like, and named no people at all. The about page carried both names
   * and the word "Co-founder", but in two separate DOM nodes inside a card, so
   * the relationship between them was something a machine had to infer.
   *
   * `founder` is the assertion itself, and it sits in the ROOT LAYOUT so it
   * ships on every page including the homepage. An answer engine asked who
   * founded Esquirely usually fetches the homepage and nothing else; putting
   * this only on /about would mean the claim exists on the one page such a
   * request never reaches.
   *
   * See lib/seo FOUNDERS for why the names are in natural case here and shouted
   * on screen, and for why there is no `sameAs` yet.
   */
  founder: FOUNDERS,
  sameAs: [],
}

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: SITE,
  name: 'Esquirely',
  inLanguage: 'en-NG',
  publisher: { '@id': `${SITE}/#organization` },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* en-NG, not en. The market is the whole proposition here, and the region
       subtag is a signal to every consumer of this page that the content is
       Nigerian rather than generically English. */
    <html lang="en-NG">
      <head>
        <JsonLd data={[ORGANIZATION, WEBSITE]} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        {children}
        <SmallScreenNotice />
        <ReferralCapture />
      </body>
    </html>
  )
}
