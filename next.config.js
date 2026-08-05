/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
    ],
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
