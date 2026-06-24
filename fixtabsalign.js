const fs = require('fs');
const content = fs.readFileSync('src/app/tools/interview-prep/page.tsx', 'utf8');

const oldTabs = `            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(250,246,240,0.1)' }}>`;

const newTabs = `            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(250,246,240,0.1)', maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>`;

const updated = content.replace(oldTabs, newTabs);
fs.writeFileSync('src/app/tools/interview-prep/page.tsx', updated);
console.log('done');