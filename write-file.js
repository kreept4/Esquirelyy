const fs = require('fs');

// --- globals.css ---
let css = fs.readFileSync('src/app/globals.css', 'utf8');

css = css.replace('--ink: #8B3A3A;', '--ink: #1A1A1A;');
css = css.replace('--ink-light: #A84A4A;', '--ink-light: #2C2C2C;');
css = css.replace('--ink-muted: #C47070;', '--ink-muted: #4A4A4A;');
css = css.replace(/rgba\(139, 58, 58,/g, 'rgba(26, 26, 26,');

fs.writeFileSync('src/app/globals.css', css);

// --- tailwind.config.js ---
let tw = fs.readFileSync('tailwind.config.js', 'utf8');

tw = tw.replace("DEFAULT: '#8B3A3A',", "DEFAULT: '#1A1A1A',");
tw = tw.replace("light: '#7A2424',", "light: '#2C2C2C',");
tw = tw.replace("muted: '#9A3A3A',", "muted: '#4A4A4A',");
tw = tw.replace("new: '#8B3A3A',", "new: '#1A1A1A',");

fs.writeFileSync('tailwind.config.js', tw);

console.log('done — ink remapped to charcoal, burgundy eliminated');