import { notFound } from 'next/navigation'

/**
 * Development-only multi-device preview.
 *
 * Every page on this site has to hold up on a phone, a tablet and a large
 * display, and until now there was no way to check that without trusting the
 * browser extension's window resize, which does not change the captured
 * viewport. An iframe does: it establishes its own viewport, so the media
 * queries inside it fire at the iframe's width rather than the window's.
 *
 * Usage: /device-preview?path=/news
 *
 * Returns a 404 in production. This is a workbench, not a page, and it should
 * never be reachable on the deployed site.
 */

/* Three frames, not five. Every frame is a full page load, and the heading
   animation alone mounts one motion component per character, so five at once
   made the harness slower to render than the pages it is checking. 360 is the
   narrowest phone worth supporting, 744 is where the tablet layout lives, and
   1024 is the last width before the desktop grid. Anything wider is already
   visible in the browser window itself. */
const DEVICES = [
  { label: 'Phone, small', w: 360, h: 820 },
  { label: 'iPad mini', w: 744, h: 900 },
  { label: 'iPad Pro', w: 1024, h: 900 },
]

export default async function DevicePreview({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>
}) {
  if (process.env.NODE_ENV === 'production') notFound()

  const { path } = await searchParams
  // Same-origin paths only. Without this the harness would happily frame any
  // URL handed to it in a query string.
  const target = path && path.startsWith('/') && !path.startsWith('//') ? path : '/news'

  return (
    <main style={{ background: '#1A1A1A', minHeight: '100vh', padding: '1.5rem' }}>
      <p
        style={{
          color: '#FAF6F0',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          marginBottom: '1.25rem',
        }}
      >
        {target} — add <code>?path=/firms</code> to preview another page
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', overflowX: 'auto' }}>
        {DEVICES.map(d => (
          <div key={d.label} style={{ flex: '0 0 auto' }}>
            <p
              style={{
                color: 'rgba(250,246,240,0.6)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              {d.label} · {d.w}px
            </p>
            <iframe
              src={target}
              title={`${target} at ${d.w}px`}
              width={d.w}
              height={d.h}
              style={{ border: '1px solid rgba(250,246,240,0.25)', background: '#fff' }}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
