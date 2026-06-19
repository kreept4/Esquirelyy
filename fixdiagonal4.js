const fs = require('fs');

function fixPanel(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Remove the broken SVG seam entirely
  c = c.replace(
    /      <svg className="auth-seam"[\s\S]*?<\/svg>\n/,
    ''
  );

  // Remove .auth-seam CSS reference
  c = c.replace(
    `        .auth-seam{ display:block !important; }\n`,
    ''
  );

  // Apply clip-path directly to panel-col with correct angle (this is the simplest reliable method)
  c = c.replace(
    `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
      }`,
    `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
        clip-path: polygon(40px 0, 100% 0, 100% 100%, 0 100%);
      }`
  );

  // Shrink the quote mark watermark to read as an actual quote mark
  c = c.replace(
    `.auth-panel-mark{
        position:absolute;
        top:6%;
        left:8%;
        font-family:'Playfair Display', Georgia, serif;
        font-size:14rem;
        font-weight:700;
        color:rgba(250,246,240,0.07);
        line-height:1;
        user-select:none;
        pointer-events:none;
      }`,
    `.auth-panel-mark{
        position:absolute;
        top:8%;
        left:10%;
        font-family:'Playfair Display', Georgia, serif;
        font-size:5rem;
        font-weight:700;
        color:rgba(250,246,240,0.18);
        line-height:1;
        user-select:none;
        pointer-events:none;
      }`
  );

  fs.writeFileSync(filePath, c);
  console.log(filePath + ': applied');
}

fixPanel('src/app/auth/signup/page.tsx');
fixPanel('src/app/auth/login/page.tsx');