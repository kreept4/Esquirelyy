const fs = require('fs');

function fixPanel(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Remove the broken ::before wedge attempt
  const oldBlock = `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
      }
      .auth-panel-col::before{
        content:'';
        position:absolute;
        top:0;
        left:-60px;
        width:120px;
        height:100%;
        background:#FAF6F0;
        clip-path: polygon(0 0, 50px 0, 0 100%, 0 100%);
        z-index:2;
      }`;

  const newBlock = `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
      }`;

  if (c.includes(oldBlock)) {
    c = c.replace(oldBlock, newBlock);
  } else {
    console.log(filePath + ': old wedge block not found, checking for plain clip-path version');
  }

  // Inject SVG wedge as a sibling right before the panel col, inside auth-page
  const panelColJSX = `      <div className="auth-panel-col">`;
  const wedgeJSX = `      <svg className="auth-seam" viewBox="0 0 60 100" preserveAspectRatio="none" style={{ position:'absolute', top:0, bottom:0, left:'50%', width:'60px', height:'100%', zIndex:5, display:'none' }}>
        <polygon points="60,0 60,100 0,100" fill="#FAF6F0" />
      </svg>
      <div className="auth-panel-col">`;

  if (c.includes(panelColJSX) && !c.includes('auth-seam')) {
    c = c.replace(panelColJSX, wedgeJSX);
  }

  // Make auth-page position relative so absolute seam works, and seam visible at same breakpoint as panel
  c = c.replace(
    `.auth-page{
        min-height:100vh;
        display:flex;
        background:#FAF6F0;
      }`,
    `.auth-page{
        min-height:100vh;
        display:flex;
        background:#FAF6F0;
        position:relative;
      }`
  );

  c = c.replace(
    `@media (min-width: 880px){
        .auth-panel-col{ display:block; }
      }`,
    `@media (min-width: 880px){
        .auth-panel-col{ display:block; }
        .auth-seam{ display:block !important; }
      }`
  );

  fs.writeFileSync(filePath, c);
  console.log(filePath + ': seam applied');
}

fixPanel('src/app/auth/signup/page.tsx');
fixPanel('src/app/auth/login/page.tsx');