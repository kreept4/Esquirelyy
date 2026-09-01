import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="vh-min-full"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
        background: '#FAF7F2',
      }}
    >
      <img
        src="/illustrations/404-illustration.svg"
        alt=""
        style={{
          width: '100%',
          maxWidth: '420px',
          marginBottom: '2.5rem',
        }}
      />

      <h1
        style={{
          fontFamily: 'var(--font-display)', letterSpacing: '-0.025em',
          fontSize: '2rem',
          color: '#0A2342',
          marginBottom: '0.75rem',
        }}
      >
        This page wandered off
      </h1>

      <p
        style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontSize: '1rem',
          color: '#0A2342',
          opacity: 0.7,
          marginBottom: '2rem',
          maxWidth: '420px',
        }}
      >
        The page you are looking for does not exist or may have moved.
      </p>

      <Link
        href="/"
        style={{
          fontFamily: 'Schibsted Grotesk, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#FAF7F2',
          background: '#0A2342',
          padding: '0.75rem 1.75rem',
          borderRadius: '999px',
          textDecoration: 'none',
        }}
      >
        Back to home
      </Link>
    </div>
  )
}