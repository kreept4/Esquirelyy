const fs = require('fs');
let svg = fs.readFileSync('public/job-hunt-hero.svg', 'utf8');

// Find the background blob - it's the very first fill:#8B3A3A in the file
const firstBurgundy = svg.indexOf('fill:#8B3A3A');
svg = svg.slice(0, firstBurgundy) + 'fill:#D6EAF8' + svg.slice(firstBurgundy + 12);

// Remove the white opacity overlay right after it
svg = svg.replace('style="fill:#fff;opacity:0.7000000000000001"', 'style="display:none"');

fs.writeFileSync('public/job-hunt-hero.svg', svg);
console.log('D6EAF8 present:', svg.includes('D6EAF8'));