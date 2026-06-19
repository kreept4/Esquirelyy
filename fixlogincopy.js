const fs = require('fs');
let c = fs.readFileSync('src/app/auth/login/page.tsx', 'utf8');

const old = `<p className="auth-panel-headline">Every opportunity.<br/>One platform.</p>
            <p className="auth-panel-copy">Jobs, vacation schemes, pupillages, and scholarships for Nigerian legal professionals, in one place.</p>`;

const next = `<p className="auth-panel-headline">Welcome back.</p>
            <p className="auth-panel-copy">Pick up where you left off. New roles and scholarships are added every week.</p>`;

if (c.includes(old)) {
  c = c.replace(old, next);
  fs.writeFileSync('src/app/auth/login/page.tsx', c);
  console.log('done');
} else {
  console.log('not found');
}