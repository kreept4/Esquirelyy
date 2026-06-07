const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Firms without logos
const firms = [
  { slug: 'spa-ajibade', website: 'https://spaajibade.com', name: 'SPA Ajibade' },
  { slug: 'acas-law', website: 'https://acas-law.com', name: 'ACAS-Law' },
  { slug: 'wole-olanipekun', website: 'https://woleolanipekun.com', name: 'Wole Olanipekun' },
  { slug: 'bloomfield-law', website: 'https://bloomfield-law.com', name: 'Bloomfield Law' },
  { slug: 'simmons-cooper', website: 'https://scp-law.com', name: 'Simmons Cooper' },
  { slug: 'george-etomi', website: 'https://geplaw.com', name: 'George Etomi' },
  { slug: 'tayo-oyetibo', website: 'https://tayooyetibolaw.com', name: 'Tayo Oyetibo' },
  { slug: 'primera-africa', website: 'https://primeraal.com', name: 'Primera Africa' },
  { slug: 'dealhq-partners', website: 'https://dealhqpartner.com', name: 'DealHQ' },
  { slug: 'famsville-solicitors', website: 'https://famsvillesolicitors.com', name: 'Famsville' },
  { slug: 'resolution-law', website: 'https://resolutionlawng.com', name: 'Resolution Law' },
  { slug: 'mike-igbokwe', website: 'https://mikeigbokwe.com', name: 'Mike Igbokwe' },
  { slug: 'blackfriars-law', website: 'https://blackfriars-law.com', name: 'Blackfriars Law' },
];

const outDir = path.join(__dirname, 'downloaded-logos');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function get(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ body: data, type: res.headers['content-type'] || '' }));
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => { fs.unlinkSync(dest); reject(err); });
  });
}

function extractOgImage(html, baseUrl) {
  const patterns = [
    /og:image[^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*og:image/i,
    /og:image[^>]*content=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1] && m[1].startsWith('http')) return m[1];
    if (m && m[1]) return new URL(m[1], baseUrl).href;
  }
  return null;
}

function extractFavicon(html, baseUrl) {
  const patterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) {
      const href = m[1];
      if (href.startsWith('http')) return href;
      return new URL(href, baseUrl).href;
    }
  }
  return new URL('/favicon.ico', baseUrl).href;
}

async function processFirm(firm) {
  console.log(`\nProcessing: ${firm.name}`);
  try {
    const { body: html } = await get(firm.website);

    // Try og:image first (usually the logo)
    const ogImg = extractOgImage(html, firm.website);
    if (ogImg) {
      const ext = ogImg.split('?')[0].split('.').pop().split('/').pop() || 'png';
      const filename = `${firm.slug}.${ext.length < 6 ? ext : 'png'}`;
      const dest = path.join(outDir, filename);
      await downloadFile(ogImg, dest);
      const size = fs.statSync(dest).size;
      if (size > 1000) {
        console.log(`  OG image: ${filename} (${size} bytes)`);
        return { slug: firm.slug, file: filename, source: 'og:image' };
      }
    }

    // Fall back to favicon
    const favicon = extractFavicon(html, firm.website);
    const ext = favicon.split('?')[0].split('.').pop() || 'ico';
    const filename = `${firm.slug}.${ext.length < 6 ? ext : 'png'}`;
    const dest = path.join(outDir, filename);
    await downloadFile(favicon, dest);
    const size = fs.statSync(dest).size;
    if (size > 100) {
      console.log(`  Favicon: ${filename} (${size} bytes)`);
      return { slug: firm.slug, file: filename, source: 'favicon' };
    }

    console.log(`  Nothing usable found`);
    return { slug: firm.slug, file: null, source: 'none' };
  } catch (e) {
    console.log(`  Error: ${e.message}`);
    return { slug: firm.slug, file: null, source: 'error' };
  }
}

(async () => {
  const results = [];
  for (const firm of firms) {
    const r = await processFirm(firm);
    results.push(r);
  }

  console.log('\n\n=== SUMMARY ===');
  results.forEach(r => console.log(`${r.slug}: ${r.file || 'FAILED'} (${r.source})`));

  const succeeded = results.filter(r => r.file);
  console.log(`\n${succeeded.length}/${firms.length} logos downloaded to ./downloaded-logos/`);
  console.log('\nUpload those files to your Supabase firm-logos bucket, then run updatelogos.js');

  // Write a follow-up script to update firms-data.ts
  const updates = succeeded.map(r => `  d = d.replace("slug: '${r.slug}',", "slug: '${r.slug}',\\n    logoFile: '${r.file}',");`).join('\n');
  fs.writeFileSync('updatelogos.js', `const fs = require('fs');\nlet d = fs.readFileSync('src/lib/firms-data.ts', 'utf8');\n${updates}\nfs.writeFileSync('src/lib/firms-data.ts', d);\nconsole.log('done');\n`);
  console.log('\nupdatelogos.js written — run it after uploading to Supabase.');
})();