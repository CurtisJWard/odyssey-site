#!/usr/bin/env node
/**
 * Sync spec homes + pipeline lots from the Odyssey Homes Job Progress sheet.
 *
 * Reads the public Job Progress Google Sheet, applies the categorization
 * rules below, and writes two auto-generated TypeScript modules that the
 * website imports.
 *
 * Run:
 *   node scripts/sync-odyssey-jobs.mjs                  # update data files
 *   node scripts/sync-odyssey-jobs.mjs --deploy         # also build + deploy
 *
 * Rules (per Curtis 2026-05-26):
 *   1. Homeowner = "Spec" AND dig date ≤ 90 days from today (or in past)
 *        → Quick Move-Ins (will be a buildable spec home soon / now)
 *   2. Homeowner = "Spec" AND dig date > 90 days from today
 *        → Available Lots ("pipeline lot" — lot committed, plan flexible)
 *   3. Homeowner = anything else (Burns, Smith, "26 Parade", …)
 *        → Removed (sold)
 *   4. Address starts with "Future " (Future Spec / Future Pre-Sold Slot)
 *        → Skipped (internal planning slot, not yet a real listing)
 *   5. Subdivision not one of our public communities → Skipped
 *   6. Plan name not in plans.ts → Skipped (logged so we notice)
 *
 * Price extraction: trailing $XXX,XXX in the Address cell is the list price.
 * If no price, the website shows "Coming Soon".
 *
 * Outputs (never edit by hand):
 *   src/data/_generatedSpecs.ts
 *   src/data/_generatedPipelineLots.ts
 *
 * Manual data:
 *   src/data/lots.ts contains a `manualLots` array merged with the generated
 *   pipeline lots — Curtis-curated raw lots from developer pricing PDFs etc.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SHEET_ID = '1tWrK9tvOyNCl5WcPUXNzYmHKU_1VEpD8A5yKiGk54Z8';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const THRESHOLD_DAYS = 90;

const COMMUNITY_SLUGS = {
  'Granite Creek':      'granite-creek',
  'Hawks Landing':      'hawks-landing',
  'Sandcreek Estates':  'sand-creek-estates',
  'Sand Creek Estates': 'sand-creek-estates',
  'The Parks':          'the-parks',
  'Moser Estates':      'moser-estates',
};

const PLAN_SLUGS = {
  'Ashwood':   'ashwood',   'Aria':       'aria',
  'Birch':     'birch',     'Charleston': 'charleston',
  'Clearwater':'clearwater','Cottage':    'cottage',
  'Cottonwood':'cottonwood','Cypress':    'cypress',
  'Oak Haven': 'oak-haven', 'Oleander':   'oleander',
  'Ponderosa': 'ponderosa', 'Redwood':    'redwood',
  'Rockford':  'rockford',  'Sage':       'sage',
  'White Pine':'white-pine','Willow':     'willow',
};

// ────────────────────────────────────────────────────────────────────────
// CSV parser — handles quoted fields with embedded commas + newlines
// ────────────────────────────────────────────────────────────────────────
function parseCsv(text) {
  const rows = [];
  let cur = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        cur.push(field);
        if (cur.some(v => v !== '')) rows.push(cur);
        cur = []; field = '';
        if (c === '\r' && n === '\n') i++;
      } else { field += c; }
    }
  }
  if (field !== '' || cur.length) { cur.push(field); if (cur.some(v => v !== '')) rows.push(cur); }
  return rows;
}

function parsePrice(address) {
  const m = address.match(/\$([0-9][\d,]*)/);
  if (!m) return { address: address.replace(/\s+/g, ' ').trim(), price: undefined };
  const price = parseInt(m[1].replace(/,/g, ''), 10);
  const clean = address.replace(/\$[\d,]+/g, '').replace(/\s+/g, ' ').trim();
  return { address: clean, price };
}

function parseLotBlock(code) {
  const m = (code || '').trim().match(/^L(\d+)B(\d+)D(\d+)$/);
  if (!m) return null;
  return { lot: m[1], block: m[2], division: m[3] };
}

function parseDigDate(s) {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  return new Date(year, parseInt(m[1], 10) - 1, parseInt(m[2], 10));
}

function formatCompletion(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Tentative completion = dig date + 7 months (per Curtis 2026-05-26)
const BUILD_DURATION_MONTHS = 7;
function addMonths(date, months) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function slugifyAddress(addr) {
  return addr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function tsLiteral(v) {
  if (v === undefined || v === null) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

// ────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────
console.log(`Fetching ${CSV_URL}`);
const res = await fetch(CSV_URL);
if (!res.ok) {
  console.error(`Sheet fetch failed: HTTP ${res.status}`);
  process.exit(1);
}
const csv = await res.text();
const rows = parseCsv(csv);
if (rows.length < 2) {
  console.error('Sheet returned no rows.');
  process.exit(1);
}

const header = rows[0].map(h => h.trim());
const idx = {
  address:    header.indexOf('Address'),
  lotBlock:   header.indexOf('Lot/Block:'),
  subdivision:header.indexOf('Subdivision:'),
  homeowner:  header.indexOf('Homeowner:'),
  floorPlan:  header.indexOf('floor plan:'),
  dig:        header.indexOf('Dig:'),
  tentClosing:header.indexOf('tent closing:'),
};

for (const [k, v] of Object.entries(idx)) {
  if (v === -1) {
    console.error(`Sheet missing expected column: ${k}`);
    process.exit(1);
  }
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const threshold = new Date(today);
threshold.setDate(threshold.getDate() + THRESHOLD_DAYS);

const specs = [];
const pipelineLots = [];
const skipped = { placeholder: 0, sold: 0, foreignCommunity: [], unknownPlan: [], noDigDate: 0 };

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const addressRaw = (row[idx.address] || '').trim();
  if (!addressRaw || addressRaw.startsWith('Future ')) { skipped.placeholder++; continue; }

  const homeowner = (row[idx.homeowner] || '').trim();
  if (homeowner !== 'Spec') { skipped.sold++; continue; }

  const subdivision = (row[idx.subdivision] || '').trim();
  const communitySlug = COMMUNITY_SLUGS[subdivision];
  if (!communitySlug) {
    skipped.foreignCommunity.push(`${subdivision || '(blank)'} — ${addressRaw}`);
    continue;
  }

  const planName = (row[idx.floorPlan] || '').trim();
  const planSlug = PLAN_SLUGS[planName];
  if (!planSlug) {
    skipped.unknownPlan.push(`${planName || '(blank)'} — ${addressRaw}`);
    continue;
  }

  const { address, price } = parsePrice(addressRaw);
  const lotBlock = parseLotBlock(row[idx.lotBlock] || '');
  const lotNumber = lotBlock ? `Lot ${lotBlock.lot}, Block ${lotBlock.block}` : '';
  const digDate = parseDigDate(row[idx.dig]);
  // Tentative completion = dig date + 7 months (build duration, per Curtis 2026-05-26)
  const completionDate = digDate ? addMonths(digDate, BUILD_DURATION_MONTHS) : null;
  const completionLabel = completionDate ? formatCompletion(completionDate) : 'Coming Soon';

  const idSlug = slugifyAddress(address);
  const entry = {
    id: `${communitySlug}-${idSlug}`,
    communitySlug,
    lotNumber,
    address,
    planSlug,
    price,
    tentativeCompletion: completionLabel,
    status: 'available',
  };

  if (!digDate) { skipped.noDigDate++; specs.push(entry); continue; }
  if (digDate <= threshold) specs.push(entry);
  else pipelineLots.push(entry);
}

// Sort: by community, then completion soonest first
const monthIdx = { January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12 };
function sortKey(e) {
  const m = e.tentativeCompletion.match(/^(\w+)\s+(\d{4})$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return parseInt(m[2]) * 12 + (monthIdx[m[1]] || 12);
}
specs.sort((a,b) => a.communitySlug.localeCompare(b.communitySlug) || sortKey(a) - sortKey(b));
pipelineLots.sort((a,b) => a.communitySlug.localeCompare(b.communitySlug) || sortKey(a) - sortKey(b));

// ────────────────────────────────────────────────────────────────────────
// Generate output files
// ────────────────────────────────────────────────────────────────────────
function specToTs(s) {
  const parts = [
    `id: ${tsLiteral(s.id)}`,
    `communitySlug: ${tsLiteral(s.communitySlug)}`,
    `lotNumber: ${tsLiteral(s.lotNumber)}`,
    `address: ${tsLiteral(s.address)}`,
    `planSlug: ${tsLiteral(s.planSlug)}`,
    `tentativeCompletion: ${tsLiteral(s.tentativeCompletion)}`,
    `status: ${tsLiteral(s.status)}`,
  ];
  if (s.price !== undefined) parts.push(`price: ${s.price}`);
  return `  { ${parts.join(', ')} },`;
}

function lotToTs(l) {
  const parts = [
    `id: ${tsLiteral(l.id)}`,
    `communitySlug: ${tsLiteral(l.communitySlug)}`,
    `lotNumber: ${tsLiteral(l.lotNumber)}`,
    `address: ${tsLiteral(l.address)}`,
    `status: ${tsLiteral(l.status)}`,
    `compatiblePlans: [${tsLiteral(l.planSlug)}]`,
    `notes: ${tsLiteral(`Spec planned: ${l.planSlug} · ${l.tentativeCompletion}`)}`,
  ];
  return `  { ${parts.join(', ')} },`;
}

const generatedHeader = (filename, source) => `// ⚠️  AUTO-GENERATED — DO NOT EDIT BY HAND ⚠️
// Source: Odyssey Homes Job Progress sheet
// Generated: ${new Date().toISOString()}
// Re-run: \`node scripts/sync-odyssey-jobs.mjs\`
// ${source}

`;

// _generatedSpecs.ts
const specsContent =
  generatedHeader('_generatedSpecs.ts', 'Specs with dig date ≤90 days (quick move-ins).') +
  `import type { SpecHome } from './specHomes';\n\n` +
  `export const generatedSpecs: SpecHome[] = [\n` +
  specs.map(specToTs).join('\n') + '\n' +
  `];\n`;

await fs.writeFile(path.join(ROOT, 'src/data/_generatedSpecs.ts'), specsContent);
console.log(`✓ Wrote src/data/_generatedSpecs.ts (${specs.length} specs)`);

// _generatedPipelineLots.ts
const pipelineContent =
  generatedHeader('_generatedPipelineLots.ts', 'Specs with dig date >90 days (pipeline lots — plan flexible).') +
  `import type { Lot } from './lots';\n\n` +
  `export const generatedPipelineLots: Lot[] = [\n` +
  pipelineLots.map(lotToTs).join('\n') + '\n' +
  `];\n`;

await fs.writeFile(path.join(ROOT, 'src/data/_generatedPipelineLots.ts'), pipelineContent);
console.log(`✓ Wrote src/data/_generatedPipelineLots.ts (${pipelineLots.length} pipeline lots)`);

// ────────────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────────────
console.log('');
console.log('━━━ Sync summary ━━━');
console.log(`Today: ${today.toISOString().slice(0,10)} · Threshold: ${threshold.toISOString().slice(0,10)} (90 days)`);
console.log(`  Quick Move-Ins (≤90d): ${specs.length}`);
console.log(`  Pipeline Lots (>90d):  ${pipelineLots.length}`);
console.log(`  Skipped:`);
console.log(`    Placeholder rows:      ${skipped.placeholder}`);
console.log(`    Sold (homeowner set):  ${skipped.sold}`);
console.log(`    No dig date:           ${skipped.noDigDate} (defaulted to quick-move-ins)`);
if (skipped.foreignCommunity.length) {
  console.log(`    Foreign subdivisions (${skipped.foreignCommunity.length}):`);
  skipped.foreignCommunity.forEach(s => console.log(`      - ${s}`));
}
if (skipped.unknownPlan.length) {
  console.log(`    Unknown plans (${skipped.unknownPlan.length}):`);
  skipped.unknownPlan.forEach(s => console.log(`      - ${s}`));
}
console.log('');

// ────────────────────────────────────────────────────────────────────────
// Optional: build + deploy
// ────────────────────────────────────────────────────────────────────────
if (process.argv.includes('--deploy')) {
  console.log('━━━ Deploying ━━━');
  const buildRes = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: ROOT });
  if (buildRes.status !== 0) { console.error('Build failed'); process.exit(1); }

  const deployRes = spawnSync('npx', [
    'wrangler', 'pages', 'deploy', 'dist',
    '--project-name=odyssey-site', '--branch=main', '--commit-dirty=true'
  ], {
    stdio: 'inherit', cwd: ROOT,
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: '14177184a4d40bc57187721d6ff16a21' },
  });
  if (deployRes.status !== 0) { console.error('Deploy failed'); process.exit(1); }
  console.log('✓ Deployed');
}
