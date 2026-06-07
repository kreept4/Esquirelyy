const fs = require('fs');
let c = fs.readFileSync('src/app/firms/page.tsx', 'utf8');

// The FirmAvatar call got inserted but the surrounding broken markup remains
// Find and clean the entire header row div that contains the avatar
const broken = `                    <FirmAvatar logoFile={firm.logoFile} name={firm.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>`;

const fixed = `                    <FirmAvatar logoFile={firm.logoFile} name={firm.name} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>`;

if (c.includes(broken)) {
  c = c.replace(broken, fixed);
  fs.writeFileSync('src/app/firms/page.tsx', c);
  console.log('fixed');
} else {
  // Show context around FirmAvatar to diagnose
  const idx = c.indexOf('<FirmAvatar');
  console.log('context around FirmAvatar:');
  console.log(c.slice(idx - 50, idx + 300));
}