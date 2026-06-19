const fs = require('fs');
let c = fs.readFileSync('src/app/tracker/page.tsx', 'utf8');

c = c.replace(
  'const [apps, setApps] = useState<Application[]>(SEED)',
  'const [apps, setApps] = useState<Application[]>([])'
);

fs.writeFileSync('src/app/tracker/page.tsx', c);
console.log('done');