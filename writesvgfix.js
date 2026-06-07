const fs = require('fs');

let icons = fs.readFileSync('src/app/HomeIcons.tsx', 'utf8');

// Read the raw SVG and convert style="..." to JSX style={{...}}
const svgRaw = fs.readFileSync('C:/Users/syg/Downloads/Job hunt-bro.svg', 'utf8');

const jsxSvg = svgRaw
  .replace(/#EC5A5A/gi, '#8B3A3A')
  .replace(/<\?xml[^>]*\?>/g, '')
  .replace(/<!DOCTYPE[^>]*>/g, '')
  .replace(/\s*id="[^"]*"/g, '')
  .replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full max-w-lg" aria-hidden="true">')
  .replace(/style="([^"]*)"/g, (match, p1) => {
    const entries = p1.split(';').filter(s => s.trim());
    const obj = entries.map(entry => {
      const colonIdx = entry.indexOf(':');
      const key = entry.slice(0, colonIdx).trim();
      const val = entry.slice(colonIdx + 1).trim();
      const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `${camel}:"${val}"`;
    }).join(',');
    return `style={{${obj}}}`;
  });

icons = icons.replace(
  /if \(type === 'hero'\) return \(\s*[\s\S]*?(?=\n\s*\)\n\s*const icons|\n\s*\)\n\s*const icons)/,
  `if (type === 'hero') return (\n    ${jsxSvg.trim()}\n  )`
);

fs.writeFileSync('src/app/HomeIcons.tsx', icons);
console.log('done');