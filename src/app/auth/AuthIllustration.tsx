'use client'

export default function AuthIllustration() {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '100vh',
      backgroundColor: '#1A1A1A',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '3rem', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <line x1="0" y1="100" x2="400" y2="100" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="0" y1="200" x2="400" y2="200" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="0" y1="300" x2="400" y2="300" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="0" y1="400" x2="400" y2="400" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="0" y1="500" x2="400" y2="500" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="100" y1="0" x2="100" y2="600" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="200" y1="0" x2="200" y2="600" stroke="#FAF6F0" strokeWidth="0.5"/>
          <line x1="300" y1="0" x2="300" y2="600" stroke="#FAF6F0" strokeWidth="0.5"/>
        </svg>
      </div>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '320px' }}>
        <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#FAF6F0', lineHeight: 1.1, marginBottom: '2rem' }}>
          Every opportunity.<br />One platform.
        </p>
        <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.85rem', color: 'rgba(250,246,240,0.65)', lineHeight: 1.75, marginBottom: '3rem' }}>
          Jobs, internships, and scholarships for Nigerian legal professionals, in one place.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            'Verified listings from top Nigerian firms',
            'Scholarships updated weekly',
            'AI-powered CV and cover letter tools',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(250,246,240,0.5)', flexShrink: 0, marginTop: '7px' }} />
              <p style={{ fontFamily: 'Schibsted Grotesk, sans-serif', fontSize: '0.8rem', color: 'rgba(250,246,240,0.6)', lineHeight: 1.6 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
      <p style={{ position: 'absolute', bottom: '2rem', fontFamily: 'Schibsted Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'rgba(250,246,240,0.4)' }}>
        Esquirely.
      </p>
    </div>
  )
}
