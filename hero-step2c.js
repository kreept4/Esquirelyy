const fs = require('fs');
const path = require('path');

const navPath = path.join('src', 'components', 'layout', 'Navbar.tsx');
let nav = fs.readFileSync(navPath, 'utf8');
let patched = 0;
const results = [];

// 1. Add heroActive state after scrolled state
if (nav.includes('heroActive')) {
  results.push('state: already present, skipped');
  patched++;
} else if (nav.includes('const [scrolled, setScrolled] = useState(false)')) {
  nav = nav.replace(
    'const [scrolled, setScrolled] = useState(false)',
    "const [scrolled, setScrolled] = useState(false)\r\n  const [heroActive, setHeroActive] = useState(false)"
  );
  results.push('state: patched');
  patched++;
} else {
  results.push('state: ANCHOR NOT FOUND');
}

// 2. Insert heroActive useEffect right before handleSignOut function
if (nav.includes('setHeroActive(window.scrollY')) {
  results.push('effect: already present, skipped');
  patched++;
} else if (nav.includes('async function handleSignOut() {')) {
  const newEffect = `useEffect(() => {\r\n    if (pathname !== '/') { setHeroActive(false); return }\r\n    const heroHandler = () => setHeroActive(window.scrollY < window.innerHeight - 100)\r\n    heroHandler()\r\n    window.addEventListener('scroll', heroHandler)\r\n    return () => window.removeEventListener('scroll', heroHandler)\r\n  }, [pathname])\r\n\r\n  `;
  nav = nav.replace(
    'async function handleSignOut() {',
    newEffect + 'async function handleSignOut() {'
  );
  results.push('effect: patched');
  patched++;
} else {
  results.push('effect: ANCHOR NOT FOUND (looking for "async function handleSignOut() {")');
}

// 3. Add opacity/pointerEvents right after the transition phrase in header style
if (nav.includes('pointerEvents: heroActive')) {
  results.push('header style: already present, skipped');
  patched++;
} else if (nav.includes(`transition: 'all 0.3s ease'`)) {
  nav = nav.replace(
    `transition: 'all 0.3s ease'`,
    `transition: 'all 0.3s ease', opacity: heroActive ? 0 : 1, pointerEvents: heroActive ? 'none' : 'auto'`
  );
  results.push('header style: patched');
  patched++;
} else {
  results.push('header style: ANCHOR NOT FOUND (looking for "transition: \'all 0.3s ease\'")');
}

console.log(results.join('\n'));

if (patched === 3) {
  fs.writeFileSync(navPath, nav, 'utf8');
  console.log('\n✓ Navbar.tsx patched and saved (3/3)');
} else {
  console.log(`\n✗ Navbar.tsx NOT saved — only ${patched}/3. See ANCHOR NOT FOUND lines above.`);
}
