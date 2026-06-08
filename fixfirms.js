const fs = require('fs');
let d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');

// Extract the ALL_FIRMS array content
const start = d.indexOf('export const ALL_FIRMS: Firm[] = [') + 'export const ALL_FIRMS: Firm[] = ['.length;
const end = d.lastIndexOf(']');
const before = d.slice(0, start);
const after = d.slice(end);

// Parse individual firm blocks
const firmsRaw = d.slice(start, end);
const blocks = firmsRaw.split(/(?=\n  \{)/g).map(b => b.trim()).filter(b => b.startsWith('{'));

// Add Stren & Blan if missing
const hasStren = blocks.some(b => b.includes("slug: 'stren-blan-partners'"));
if (!hasStren) {
  blocks.push(`{
    slug: 'stren-blan-partners',
    logoFile: 'StrenBlanPartners.png',
    name: 'Stren & Blan Partners',
    shortName: 'Stren & Blan',
    tier: 'Tier 2',
    email: 'Careers@strenandblan.com',
    website: 'https://strenandblan.com',
    offices: [
      { city: 'Lagos', address: '3 Theophilus Orji Street, Off Fola Osibo Road, Lekki Phase 1, Lagos' },
      { city: 'Abuja', address: 'House 22, 21 Road Kado Estate Phase 1, Abuja' },
      { city: 'Enugu', address: 'Plot 30 Republic Estate Independence Layout, Enugu' },
    ],
    practiceAreas: ['Arbitration', 'Banking & Finance', 'Capital Markets', 'Energy & Natural Resources', 'Intellectual Property', 'Shipping & Maritime', 'Real Estate', 'Tax', 'Employment'],
    description: 'A full-service commercial law firm with offices in Lagos, Abuja, and Enugu, offering broad expertise across transactions, disputes, and regulatory matters.',
    openRoles: 0,
  }`);
  console.log('Stren & Blan added');
} else {
  console.log('Stren & Blan already present');
}

// Sort alphabetically by name
blocks.sort((a, b) => {
  const nameA = (a.match(/name: '([^']+)'/) || [])[1] || '';
  const nameB = (b.match(/name: '([^']+)'/) || [])[1] || '';
  return nameA.localeCompare(nameB);
});

const newContent = before + '\n  ' + blocks.join(',\n  ') + ',\n' + after;
fs.writeFileSync('src/lib/firms-data.ts', newContent);
console.log('Done. Total firms:', blocks.length);