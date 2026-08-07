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
