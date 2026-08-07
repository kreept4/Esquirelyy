const fs = require('fs');
const path = 'src/app/HeroSection.tsx';
const raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let content = raw.replace(/\r\n/g, '\n');

const old = `      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 1.5rem 3rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'end' }}>`;

const replacement = `      <motion.div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 1.5rem 3rem', maxWidth: '1280px', margin: '0 auto', opacity: useTransform(scrollYProgress, [0, 0.35], [1, 0]) }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'end' }}>`;

if (!content.includes(old)) throw new Error('hero content wrapper not matched');
content = content.replace(old, replacement);

// close the tag correctly — swap the matching closing </div> back to </motion.div>
const oldClose = `          </div>
        </div>
      </div>


    </div>
  )
}`;
const newClose = `          </div>
        </div>
      </motion.div>


    </div>
  )
}`;
if (!content.includes(oldClose)) throw new Error('closing tag not matched');
content = content.replace(oldClose, newClose);

if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(path, content, 'utf8');
console.log('✓ HeroSection.tsx: hero text now fades out early in scroll, before reaching the nav');