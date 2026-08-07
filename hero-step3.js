const fs = require('fs');
const path = require('path');

const pagePath = path.join('src', 'app', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');
const results = [];
let ok = 0;
const TOTAL = 4;

// 1. Add import for HeroSection
if (page.includes("import HeroSection from './HeroSection'")) {
  results.push('import: already present, skipped');
  ok++;
} else if (page.includes("import FadeSection from './FadeSection'")) {
  page = page.replace(
    "import FadeSection from './FadeSection'",
    "import FadeSection from './FadeSection'\r\nimport HeroSection from './HeroSection'"
  );
  results.push('import: added');
  ok++;
} else {
  results.push('import: ANCHOR NOT FOUND ("import FadeSection from \'./FadeSection\'")');
}

// 2. Remove paddingTop: '80px' from outer wrapper div (hero is now flush to top)
if (page.includes(`className="min-h-screen bg-cream font-sans"`) && !page.includes(`paddingTop: '80px'`)) {
  results.push('paddingTop removal: already clean, skipped');
  ok++;
} else if (page.includes(`<div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '80px' }}>`)) {
  page = page.replace(
    `<div className="min-h-screen bg-cream font-sans" style={{ paddingTop: '80px' }}>`,
    `<div className="min-h-screen bg-cream font-sans">`
  );
  results.push('paddingTop removal: done');
  ok++;
} else {
  results.push('paddingTop removal: ANCHOR NOT FOUND');
}

// 3. Insert <HeroSection /> + gradient bridge right before the ticker div
const tickerMarker = 'bg-cream-dark overflow-hidden';
if (page.includes('<HeroSection')) {
  results.push('hero insert: already present, skipped');
  ok++;
} else {
  const tickerMarkerIdx = page.indexOf(tickerMarker);
  if (tickerMarkerIdx === -1) {
    results.push('hero insert: ticker marker not found');
  } else {
    const tickerDivStart = page.lastIndexOf('<div', tickerMarkerIdx);
    if (tickerDivStart === -1) {
      results.push('hero insert: could not locate ticker <div start');
    } else {
      const bridge = `<HeroSection />\r\n      <div style={{ height: '90px', background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 55%, #F2EBE1 100%)' }} />\r\n      `;
      page = page.slice(0, tickerDivStart) + bridge + page.slice(tickerDivStart);
      results.push('hero insert: done');
      ok++;
    }
  }
}

// 4. Remove the old cream hero <section> (the one with "Your legal career starts here.")
const oldHeroPhrase = 'Your legal career starts here.';
if (!page.includes(oldHeroPhrase)) {
  results.push('old hero removal: already gone, skipped');
  ok++;
} else {
  const phraseIdx = page.indexOf(oldHeroPhrase);
  const sectionStart = page.lastIndexOf('<section', phraseIdx);
  const sectionEndTagIdx = page.indexOf('</section>', phraseIdx);
  if (sectionStart === -1 || sectionEndTagIdx === -1) {
    results.push('old hero removal: could not locate section boundaries');
  } else {
    const sectionEnd = sectionEndTagIdx + '</section>'.length;
    page = page.slice(0, sectionStart) + page.slice(sectionEnd);
    // clean up any resulting double-blank-lines
    page = page.replace(/\n{3,}/g, '\n\n');
    results.push('old hero removal: done');
    ok++;
  }
}

console.log(results.join('\n'));

if (ok === TOTAL) {
  fs.writeFileSync(pagePath, page, 'utf8');
  console.log(`\n✓ page.tsx patched and saved (${ok}/${TOTAL})`);
} else {
  console.log(`\n✗ page.tsx NOT saved — only ${ok}/${TOTAL}. See lines above.`);
}
