const fs = require('fs');
let c = fs.readFileSync('src/app/HomeIcons.tsx', 'utf8');
const lines = c.split('\n');
lines.splice(2, 1);
const heroLine = "  if (type === 'hero') return (<img src='/job-hunt-hero.svg' alt='Legal career illustration' className='w-full max-w-lg' />)";
lines.splice(2, 0, heroLine);
fs.writeFileSync('src/app/HomeIcons.tsx', lines.join('\n'));
console.log('done');