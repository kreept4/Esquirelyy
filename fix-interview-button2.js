const fs = require('fs');
const p = 'src/app/tools/interview-prep/page.tsx';
let c = fs.readFileSync(p, 'utf8');
let hits = 0;

const oldBtn = `              >
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
            </div>`;

const newBtn = `              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Generating...
                  </>
                ) : 'Generate Questions'}
              </button>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginTop: '0.75rem' }}>
                AI-generated and may contain minor inaccuracies or mix-ups. Please review and edit before relying on it.
              </p>
            </div>`;

if (c.includes(oldBtn)) { c = c.replace(oldBtn, newBtn); hits++; } else { console.log('BTN_NOT_FOUND'); }

const oldHeader = `            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: ink, marginBottom: '2rem', lineHeight: 1.2 }}>
              {result.inferredRole}
            </h2>`;

const newHeader = `            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: ink, marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {result.inferredRole}
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: muted, lineHeight: 1.6, marginBottom: '2rem' }}>
              These questions are AI-generated and may contain minor inaccuracies or mix-ups. Review and adapt them to your real background before an interview.
            </p>`;

if (c.includes(oldHeader)) { c = c.replace(oldHeader, newHeader); hits++; } else { console.log('HEADER_NOT_FOUND'); }

const oldBack = '← New session';
if (c.includes(oldBack)) {
  // already correct, skip
} else {
  c = c.replace(/â† New session/, '← New session');
  hits++;
}

fs.writeFileSync(p, c);
console.log('hits: ' + hits);