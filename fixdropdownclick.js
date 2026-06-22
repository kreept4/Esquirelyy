const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

c = c.replace(
  "                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', minWidth: '240px', padding: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>",
  "                <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FAF6F0', border: '0.5px solid #E8E0D5', minWidth: '240px', padding: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 200, paddingTop: '14px' }}>"
);

fs.writeFileSync('src/components/layout/Navbar.tsx', c);
console.log('done');