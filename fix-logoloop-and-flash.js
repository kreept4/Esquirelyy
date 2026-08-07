const fs = require('fs');

function normalizedReplace(path, replacements, label) {
  const raw = fs.readFileSync(path, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let content = raw.replace(/\r\n/g, '\n');
  for (const [oldStr, newStr] of replacements) {
    const oldNorm = oldStr.replace(/\r\n/g, '\n');
    const newNorm = newStr.replace(/\r\n/g, '\n');
    if (!content.includes(oldNorm)) {
      throw new Error(`${label}: block not matched -> ${oldNorm.slice(0, 60)}...`);
    }
    content = content.replace(oldNorm, newNorm);
  }
  if (eol === '\r\n') content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(path, content, 'utf8');
  console.log(`✓ ${path}: updated`);
}

// --- Fix 1: LogoLoop real colors + bigger ---
normalizedReplace('src/app/page.tsx', [[
`                <img
                  src={src}
                  alt={firm.shortName}
                  className="h-7 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />`,
`                <img
                  src={src}
                  alt={firm.shortName}
                  className="h-[42px] w-auto object-contain"
                />`
]], 'page.tsx logo fix');

// --- Fix 2: burgundy flash on load ---
normalizedReplace('src/components/layout/Navbar.tsx', [
  [
    `  const [heroActive, setHeroActive] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()`,
    `  const pathname = usePathname()
  const router = useRouter()
  const [heroActive, setHeroActive] = useState(pathname === '/')
  const [user, setUser] = useState<any>(null)`
  ]
], 'Navbar.tsx flash fix');