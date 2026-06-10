const fs = require('fs');
let c = fs.readFileSync('src/app/firms/[slug]/page.tsx', 'utf8');

// Fix 1: top-align the flex row
c = c.replace(
  "alignItems: 'center', gap: '2rem', flexWrap: 'wrap'",
  "alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap'"
);

// Fix 2: wrap avatar in paddingTop div
c = c.replace(
  '<FirmAvatar logoFile={firm.logoFile} name={firm.name} />',
  '<div style={{ paddingTop: \'6px\' }}><FirmAvatar logoFile={firm.logoFile} name={firm.name} /></div>'
);

// Fix 3: tinted background behind name/description column
c = c.replace(
  '<div>\n                <h1 style={{ fontFamily:',
  '<div style={{ backgroundColor: \'#F2EBE1\', padding: \'1.25rem 1.5rem\', borderRadius: \'2px\', border: \'0.5px solid #E8E0D5\' }}>\n                <h1 style={{ fontFamily:'
);

fs.writeFileSync('src/app/firms/[slug]/page.tsx', c);
console.log('done');