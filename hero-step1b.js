const fs = require('fs');
const path = require('path');

const layoutPath = path.join('src', 'app', 'layout.tsx');
let layout = fs.readFileSync(layoutPath, 'utf8');

const spaceMonoLink = `<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />`;

if (layout.includes('family=Space+Mono')) {
  console.log('✗ Space Mono link already present, skipping');
} else {
  const gstaticRegex = /(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossOrigin="anonymous" \/>)/;

  if (gstaticRegex.test(layout)) {
    layout = layout.replace(gstaticRegex, `$1\r\n        ${spaceMonoLink}`);
    fs.writeFileSync(layoutPath, layout, 'utf8');
    console.log('✓ layout.tsx: Space Mono link inserted');
  } else {
    console.log('✗ gstatic preconnect line not found via regex either — manual insert needed');
  }
}
