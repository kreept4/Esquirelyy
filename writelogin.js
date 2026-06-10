const fs = require('fs');
let c = fs.readFileSync('src/app/auth/login/page.tsx', 'utf8');

// Fix redirect after login — check onboarding status
c = c.replace(
  `    router.push(redirect)
    router.refresh()`,
  `    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await (supabase as any).from('profiles').select('onboarding_complete').eq('id', user.id).single()
      if (!profile || !profile.onboarding_complete) {
        router.push('/auth/welcome')
        return
      }
    }
    router.push(redirect)
    router.refresh()`
);

// Fix loading button color
c = c.replace(
  "backgroundColor: loading ? '#6B8CAE' : '#8B3A3A'",
  "backgroundColor: loading ? '#C47070' : '#8B3A3A'"
);

// Fix Esquirely wordmark — add fullstop
c = c.replace(
  '          Esquirely\n        </span>',
  '          Esquirely.\n        </span>'
);

fs.writeFileSync('src/app/auth/login/page.tsx', c);
console.log('done');