const fs = require('fs');

const svgRaw = fs.readFileSync('C:/Users/syg/Downloads/Job hunt-bro.svg', 'utf8');

const recolored = svgRaw
  .replace(/#EC5A5A/gi, '#8B3A3A')
  .replace(/#263238/gi, '#1A1A1A')
  .replace(/class="[^"]*"/g, '')
  .replace(/<\?xml[^>]*>/g, '')
  .replace(/<!DOCTYPE[^>]*>/g, '')
  .replace(/<svg/, '<svg className="w-full max-w-lg" aria-hidden="true"');

let icons = fs.readFileSync('src/app/HomeIcons.tsx', 'utf8');

icons = icons.replace(
  /if \(type === 'hero'\) return \(\s*[\s\S]*?(?=\n\s*const icons)/,
  "if (type === 'hero') return (\n    " + recolored.trim() + "\n  )\n\n  "
);

fs.writeFileSync('src/app/HomeIcons.tsx', icons);
console.log('done');