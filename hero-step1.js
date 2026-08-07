const fs = require('fs');
const path = require('path');

// --- 1. layout.tsx: add Space Mono font links ---
const layoutPath = path.join('src', 'app', 'layout.tsx');
let layout = fs.readFileSync(layoutPath, 'utf8');

const fontLinkTag = `        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />`;

const oldFontBlock = `        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />`;

if (layout.includes(oldFontBlock)) {
  layout = layout.replace(oldFontBlock, fontLinkTag);
  fs.writeFileSync(layoutPath, layout, 'utf8');
  console.log('✓ layout.tsx: Space Mono link added');
} else {
  console.log('✗ layout.tsx: expected font block not found, skipped (check manually)');
}

// --- 2. globals.css: add liquid glass + space mono classes ---
const cssPath = path.join('src', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const additions = `
/* --- Hero facelift: liquid glass + Space Mono (hero only) --- */
.space-mono-regular {
  font-family: "Space Mono", monospace;
  font-weight: 400;
  font-style: normal;
}
.space-mono-bold {
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-style: normal;
}
.space-mono-regular-italic {
  font-family: "Space Mono", monospace;
  font-weight: 400;
  font-style: italic;
}
.space-mono-bold-italic {
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-style: italic;
}

.liquid-glass {
  background: rgba(0, 0, 0, 0.4);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.1) 80%, rgba(255,255,255,0.3) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
`;

if (!css.includes('Hero facelift: liquid glass')) {
  css += additions;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✓ globals.css: liquid glass + Space Mono classes added');
} else {
  console.log('✗ globals.css: additions already present, skipped');
}

console.log('\nStep 1 done. Verify with: npm run build');
