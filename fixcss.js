const fs = require('fs');
let d = fs.readFileSync('src/app/globals.css', 'utf8');

// Remove the blanket transition on all elements - causes lag
d = d.replace(
  `/* Smooth transitions for layout shifts */\n* {\n  transition: padding 0.2s ease, margin 0.2s ease;\n}`,
  `/* Smooth transitions removed - was causing layout lag */`
);

// Ticker speed - already 35s, drop to 18s on mobile
d = d.replace(
  '.animate-ticker {\n  animation: ticker 35s linear infinite;\n}',
  '.animate-ticker {\n  animation: ticker 35s linear infinite;\n}\n\n@media (max-width: 768px) {\n  .animate-ticker {\n    animation-duration: 18s;\n  }\n}'
);

fs.writeFileSync('src/app/globals.css', d);
console.log('done');