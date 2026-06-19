const fs = require('fs');

function applyDiagonal(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const oldPanelCol = `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
      }`;

  const newPanelCol = `.auth-panel-col{
        display:none;
        flex:1;
        position:relative;
        background:radial-gradient(ellipse at 30% 20%, #9C4444 0%, #7A2E2E 60%, #6B2727 100%);
        overflow:hidden;
        clip-path: polygon(4% 0, 100% 0, 100% 100%, 0% 100%);
        margin-left:-4vw;
      }`;

  if (c.includes(oldPanelCol)) {
    c = c.replace(oldPanelCol, newPanelCol);
    fs.writeFileSync(filePath, c);
    console.log(filePath + ': diagonal applied');
  } else {
    console.log(filePath + ': pattern not found - skipping');
  }
}

applyDiagonal('src/app/auth/signup/page.tsx');
applyDiagonal('src/app/auth/login/page.tsx');