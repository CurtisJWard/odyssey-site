// generate-sitemap.mjs
// Runs after `astro build`. Walks dist/ for index.html files and writes
// a complete sitemap-0.xml. Replaces the @astrojs/sitemap output which
// fails to pick up dynamic routes (getStaticPaths) in this project.

import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'https://buildodyssey.com';
const DIST_DIR = new URL('../dist', import.meta.url).pathname;

// Pages to exclude from the sitemap (not useful for SEO)
const EXCLUDE = new Set(['/404', '/terms-conditions']);

async function findIndexFiles(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const urls = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sub = await findIndexFiles(join(dir, entry.name), `${base}/${entry.name}`);
      urls.push(...sub);
    } else if (entry.name === 'index.html') {
      urls.push(base === '' ? '/' : `${base}/`);
    }
  }
  return urls;
}

const allPaths = await findIndexFiles(DIST_DIR);
const filtered = allPaths
  .filter(p => !EXCLUDE.has(p.replace(/\/$/, '')))
  .sort();

const urlTags = filtered.map(p => `  <url><loc>${BASE_URL}${p}</loc></url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;

await writeFile(join(DIST_DIR, 'sitemap-0.xml'), xml, 'utf8');
await writeFile(join(DIST_DIR, 'sitemap-index.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${BASE_URL}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
  'utf8'
);

console.log(`[sitemap] Wrote ${filtered.length} URLs to sitemap-0.xml`);
filtered.forEach(p => console.log(`  ${p}`));
