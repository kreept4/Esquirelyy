const fs = require('fs');
let c = fs.readFileSync('src/app/auth/signup/page.tsx', 'utf8');

const bad = `      </div>
</div>
      </div>

      <AuthStyles />
    </div>
  )
}`;

const good = `      </div>

      <AuthStyles />
    </div>
  )
}`;

if (c.includes(bad)) {
  c = c.replace(bad, good);
  fs.writeFileSync('src/app/auth/signup/page.tsx', c);
  console.log('fixed');
} else {
  console.log('exact match not found - manual check needed');
}