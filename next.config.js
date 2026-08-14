/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
  },

  // pdfkit reads its own font data off disk at require time and resolves paths
  // relative to its package directory. Bundling it rewrites those paths and it
  // fails at runtime, so it is left as a real node_modules require.
  serverExternalPackages: ['pdfkit'],

  // The CV exporter reads the Carlito files with fs, and file tracing only
  // follows imports, so nothing tells it these are needed. Without this the
  // export route works locally, where the whole repo is on disk, and 500s in
  // production. See lib/cv/pdf.ts.
  outputFileTracingIncludes: {
    '/api/cv-export': ['./src/lib/cv/fonts/**'],
  },
  /**
   * Security headers.
   *
   * ⚠ THESE ARE NOT THE FIX FOR THE "NOT SECURE" COMPLAINTS, and it is worth
   * being honest about that up front so nobody later thinks the problem was
   * solved here. The report was RAV Endpoint Protection (ReasonLabs) blocking
   * esquirely.com.ng as a "Malicious URL". That is one antivirus vendor's
   * reputation call on a young .com.ng domain; the TLS is fine, the certificate
   * is valid, and Vercel already sends HSTS. No header can talk a third-party
   * blocklist round — that takes a false-positive report to the vendor.
   *
   * They are added because the site had none of them, which is its own problem
   * and one that automated scanners do grade on. Every one below is safe: they
   * constrain how OUR pages may be embedded and what the browser may infer, and
   * none of them can break a page that was working.
   *
   * ⚠ THERE IS DELIBERATELY NO Content-Security-Policy HERE. A CSP is the
   * header that would actually matter, and it is also the one that silently
   * breaks a site — this app uses inline <style> blocks, styled-jsx, GSAP and
   * OGL, and a policy written without testing each of those would white-screen
   * the homepage for everybody. It should be added, in report-only mode first,
   * as its own piece of work.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          /* Stops a browser second-guessing a Content-Type. Without it, a file
             we serve as text/plain can be re-interpreted as script if the bytes
             look like script — the classic route from "user upload" to "stored
             XSS". */
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          /* Nobody may frame this site. Clickjacking protection: without it, an
             attacker can load /dashboard or /tracker in an invisible iframe over
             their own page and harvest clicks from a signed-in member. */
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          /* Send the full URL only to ourselves; send just the origin to
             anyone else. Matters here specifically because a signed-in member's
             URLs carry listing slugs and redirect targets, and every outbound
             `apply_url` click would otherwise hand the employer the exact page
             they came from. */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          /* Nothing on this site needs a camera, a microphone or a location,
             so nothing may ask. Denies the capability outright rather than
             leaving it to a prompt the user has to refuse. */
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        // /opportunities was removed: it duplicated the jobs board and the
        // scholarships page, and everything on it was dead. Four roles had no
        // apply URL or email at all, and both scholarships closed in early 2026.
        // Permanent, so any existing link or search index entry follows through
        // to the board instead of hitting a 404.
        source: '/opportunities',
        destination: '/jobs',
        permanent: true,
      },
      { source: '/opportunities/:path*', destination: '/jobs', permanent: true },
    ]
  },
}
module.exports = nextConfig
