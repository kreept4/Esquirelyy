const fs = require('fs');
let c = fs.readFileSync('src/app/firms/page.tsx', 'utf8');

// Find the monogram div and replace it - search for the unique text
const search = `{getMonogram(firm.name)}`;
const replacement = `<FirmAvatar logoFile={firm.logoFile} name={firm.name} />`;

if (c.includes(search)) {
  // Replace the entire div block containing getMonogram
  c = c.replace(
    /<div style=\{\{[\s\S]*?\}\}>\s*\{getMonogram\(firm\.name\)\}\s*<\/div>/,
    replacement
  );
  fs.writeFileSync('src/app/firms/page.tsx', c);
  console.log('replaced');
} else {
  console.log('pattern not found - searching for context...');
  const idx = c.indexOf('getMonogram');
  console.log('getMonogram at index:', idx);
  console.log('context:', c.slice(idx - 100, idx + 100));
}