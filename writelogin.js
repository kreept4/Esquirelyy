const fs = require('fs');
let c = fs.readFileSync('src/app/auth/login/page.tsx', 'utf8');

// Normalize line endings first
c = c.replace(/\r\n/g, '\n');

c = c.replace(
  "    router.push(redirect)\n    router.refresh()",
  `    const sb = createClient()
    const { data: { user: u } } = await sb.auth.getUser()
    if (u) {
      const { data: prof } = await (sb as any).from('profiles').select('onboarding_complete').eq('id', u.id).single()
      if (!prof || !prof.onboarding_complete) {
        router.push('/auth/onboarding')
        return
      }
    }
    router.push(redirect)
    router.refresh()`
);

c = c.replace(
  "backgroundColor: loading ? '#6B8CAE' : '#8B3A3A'",
  "backgroundColor: loading ? '#C47070' : '#8B3A3A'"
);

fs.writeFileSync('src/app/auth/login/page.tsx', c);
console.log('done');