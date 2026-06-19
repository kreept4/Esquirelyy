const fs = require('fs');

function buildPanel(headline, copy) {
  return `      <div className="auth-panel-col">
        <div className="auth-panel-inner">
          <span className="auth-panel-mark">"</span>
          <div className="auth-panel-content">
            <p className="auth-panel-headline">${headline}</p>
            <p className="auth-panel-copy">${copy}</p>
          </div>
          <p className="auth-panel-foot">Esquirely.</p>
        </div>
      </div>`;
}

const styles = `
      .auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
      }
      .auth-panel-inner{
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:4rem 3rem;
      }
      .auth-panel-mark{
        position:absolute;
        top:6%;
        left:8%;
        font-family:'Playfair Display', Georgia, serif;
        font-size:14rem;
        font-weight:700;
        color:rgba(250,246,240,0.07);
        line-height:1;
        user-select:none;
        pointer-events:none;
      }
      .auth-panel-content{
        position:relative;
        z-index:1;
        max-width:340px;
        text-align:center;
      }
      .auth-panel-headline{
        font-family:'Playfair Display', Georgia, serif;
        font-size:clamp(1.9rem, 3.2vw, 2.5rem);
        font-weight:700;
        color:#FAF6F0;
        line-height:1.22;
        margin-bottom:1.25rem;
      }
      .auth-panel-copy{
        font-family:'DM Sans', sans-serif;
        font-size:0.92rem;
        color:rgba(250,246,240,0.7);
        line-height:1.8;
      }
      .auth-panel-foot{
        position:absolute;
        bottom:2.5rem;
        z-index:1;
        font-family:'Playfair Display', Georgia, serif;
        font-weight:700;
        font-size:1rem;
        color:rgba(250,246,240,0.45);
      }`;

// --- Update signup page ---
let signup = fs.readFileSync('src/app/auth/signup/page.tsx', 'utf8');

const oldSignupPanelStart = signup.indexOf('      <div className="auth-panel-col">');
const oldSignupPanelEnd = signup.indexOf('</div>\n      </div>\n\n      <AuthStyles');
if (oldSignupPanelStart !== -1 && oldSignupPanelEnd !== -1) {
  const before = signup.slice(0, oldSignupPanelStart);
  const after = signup.slice(oldSignupPanelEnd);
  signup = before + buildPanel(
    'Every opportunity.<br/>One platform.',
    "Jobs, vacation schemes, pupillages, and scholarships for Nigerian legal professionals, in one place."
  ) + '\n' + after;
} else {
  console.log('signup panel block not found - skipping panel swap, check manually');
}

// Replace old panel CSS block (between .auth-panel-col and .auth-panel-foot{...})
const oldCssStart = signup.indexOf('      .auth-panel-col{');
const oldCssEnd = signup.indexOf('}', signup.indexOf('.auth-panel-foot{')) + 1;
if (oldCssStart !== -1 && oldCssEnd !== -1) {
  signup = signup.slice(0, oldCssStart) + styles.trim() + signup.slice(oldCssEnd);
}

fs.writeFileSync('src/app/auth/signup/page.tsx', signup);
console.log('signup updated');