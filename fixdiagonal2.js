const fs = require('fs');

function fixPanel(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const old = `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
        clip-path: polygon(4% 0, 100% 0, 100% 100%, 0% 100%);
        margin-left:-4vw;
      }`;

  const next = `.auth-panel-col{
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

  if (c.includes(old)) {
    c = c.replace(old, next);
    fs.writeFileSync(filePath, c);
    console.log(filePath + ': fixed');
  } else {
    console.log(filePath + ': not found');
  }
}

fixPanel('src/app/auth/signup/page.tsx');
fixPanel('src/app/auth/login/page.tsx');