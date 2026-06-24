const fs = require('fs');
const p = 'src/app/tools/interview-prep/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const oldBtn = `                  >
                    {loading ? 'Generating...' : 'Generate Questions'}
                  </button>`;

const newBtn = `                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" style={{ marginRight: '8px' }} />
                        Generating...
                      </>
                    ) : 'Generate Questions'}
                  </button>

                  <p className="font-sans" style={{ fontSize: '0.7rem', color: '#A0A0A0', lineHeight: 1.6, marginTop: '0.85rem' }}>
                    AI-generated and may contain minor inaccuracies or mix-ups. Please review and edit before relying on it.
                  </p>`;

if (!c.includes(oldBtn)) { console.log('OLD_BUTTON_NOT_FOUND'); process.exit(1); }
c = c.replace(oldBtn, newBtn);

const oldResultHeader = `                      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E8E0D5' }}>
                        <p className="font-sans font-semibold uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#8B3A3A', marginBottom: '0.4rem' }}>
                          {result.interviewerPersona}
                        </p>
                        <h2 className="font-serif font-bold" style={{ fontSize: '1.6rem', color: '#1A1A1A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                          {result.inferredRole}
                        </h2>
                      </div>`;

const newResultHeader = `                      <div style={{ marginBottom: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E8E0D5' }}>
                        <p className="font-sans font-semibold uppercase" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#8B3A3A', marginBottom: '0.4rem' }}>
                          {result.interviewerPersona}
                        </p>
                        <h2 className="font-serif font-bold" style={{ fontSize: '1.6rem', color: '#1A1A1A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                          {result.inferredRole}
                        </h2>
                      </div>
                      <p className="font-sans" style={{ fontSize: '0.7rem', color: '#A0A0A0', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        These questions are AI-generated and may contain minor inaccuracies or mix-ups. Review and adapt them to your real background before an interview.
                      </p>`;

if (!c.includes(oldResultHeader)) { console.log('OLD_RESULT_HEADER_NOT_FOUND'); process.exit(1); }
c = c.replace(oldResultHeader, newResultHeader);

fs.writeFileSync(p, c);
console.log('done');