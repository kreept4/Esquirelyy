const fs = require('fs');

const responsive = `

/* ============================================================
   RESPONSIVE OVERHAUL
   Mobile: <480px | Tablet: 481-1024px | Desktop: 1025-1440px | TV: 1441px+
   ============================================================ */

/* Base padding for all inner pages */
@media (max-width: 768px) {
  main {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  /* Page headers */
  div[style*="padding: '3rem 2rem'"],
  div[style*="padding: 3rem 2rem"] {
    padding: 1.5rem 1rem !important;
  }

  /* Grid layouts — stack on mobile */
  div[style*="gridTemplateColumns"] {
    grid-template-columns: 1fr !important;
  }

  /* Firm cards grid */
  div[style*="minmax(360px"] {
    grid-template-columns: 1fr !important;
  }

  /* Jobs listing articles */
  article {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  article > div:last-child {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }

  /* Filter panels */
  div[style*="flex-wrap: wrap"] {
    gap: 0.5rem !important;
  }

  /* Firm profile header */
  div[style*="minWidth: '240px'"] {
    min-width: 0 !important;
  }

  /* Typography scale down */
  h1[style*="clamp"] {
    font-size: clamp(1.4rem, 6vw, 2rem) !important;
  }

  /* Contact/office cards padding */
  div[style*="padding: '1.25rem'"] {
    padding: 1rem !important;
  }

  /* Filter selects — full width on mobile */
  select {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Search input full width */
  input[type="text"] {
    width: 100% !important;
  }

  /* Buttons full width on mobile */
  a[style*="display: 'block'"],
  a[style*='display: "block"'] {
    width: 100% !important;
    text-align: center !important;
  }

  /* Firm avatar sizing */
  div[style*="width: '72px'"] {
    width: 56px !important;
    height: 56px !important;
  }

  /* Hide non-essential columns in job listings */
  .hide-mobile {
    display: none !important;
  }

  /* Padding adjustments for inner content areas */
  div[style*="padding: '2rem'"] {
    padding: 1rem !important;
  }

  div[style*="padding: '3rem 2rem'"] {
    padding: 1.5rem 1rem !important;
  }

  div[style*="padding: '1.5rem'"] {
    padding: 1rem !important;
  }
}

/* Tablet */
@media (min-width: 481px) and (max-width: 1024px) {
  div[style*="minmax(360px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  div[style*="repeat(auto-fit, minmax(300px"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  div[style*="maxWidth: '1280px'"] {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
}

/* Large desktop / TV */
@media (min-width: 1800px) {
  div[style*="maxWidth: '1280px'"] {
    max-width: 1600px !important;
  }

  body {
    font-size: 18px !important;
  }

  h1[style*="clamp"] {
    font-size: clamp(2.5rem, 3vw, 4rem) !important;
  }
}

/* Ultra-wide TV (4K) */
@media (min-width: 2400px) {
  div[style*="maxWidth: '1280px'"] {
    max-width: 2000px !important;
  }

  body {
    font-size: 20px !important;
  }
}

/* Smooth transitions for layout shifts */
* {
  transition: padding 0.2s ease, margin 0.2s ease;
}

/* Prevent horizontal overflow */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Fix flex wrapping on small screens */
@media (max-width: 640px) {
  div[style*="display: 'flex'"][style*="gap"] {
    flex-wrap: wrap !important;
  }

  /* Stack filter row on mobile */
  div[style*="flex: '1 1 280px'"] {
    flex: 1 1 100% !important;
  }

  /* Ticker — smaller text on mobile */
  .animate-ticker span {
    font-size: 0.75rem !important;
  }

  /* Jobs page header padding */
  div[style*="padding: '2.5rem 2rem 2rem'"] {
    padding: 1.25rem 1rem 1rem !important;
  }

  /* Firm profile two-column body */
  div[style*="repeat(auto-fit, minmax(300px, 1fr)"] {
    grid-template-columns: 1fr !important;
  }
}
`;

const globalsPath = 'src/app/globals.css';
let globals = fs.readFileSync(globalsPath, 'utf8');

if (globals.includes('RESPONSIVE OVERHAUL')) {
  console.log('Responsive block already exists — skipping.');
} else {
  globals += responsive;
  fs.writeFileSync(globalsPath, globals);
  console.log('Responsive CSS added to globals.css');
}