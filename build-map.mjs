/* build-map.mjs ───────────────────────────────────────────────────────────
 * node build-map.mjs
 *   → downloads XMLs to ./data-119/
 *   → creates  policy-subject-map-119.json
 */

import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { globSync } from 'glob';

/* ───── Config ───── */
const CONGRESS = 119;
const TYPES    = ['hr','s','hjres','sjres','hconres','sconres','hres','sres'];
const DATA_DIR = `data-${CONGRESS}`;
const OUT_FILE = `policy-subject-map-${CONGRESS}.json`;

/* ───── 1.  Download every real XML file (via sitemap) ─────────────────── */
async function downloadAll() {
  for (const type of TYPES) {
    const dir = path.join(DATA_DIR, type);
    fs.mkdirSync(dir, { recursive: true });

    const sitemap =
      `https://www.govinfo.gov/sitemap/bulkdata/BILLSTATUS/${CONGRESS}${type}/sitemap.xml`;
    const xml = await fetch(sitemap).then(r => r.ok ? r.text() : '');
    if (!xml) { console.warn(`⚠️  no sitemap for ${type}`); continue; }

    const urls = [...xml.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map(m => m[1]);
    console.log(`⏬  ${type.padEnd(6)} – ${urls.length} files`);

    await Promise.all(urls.map(async u => {
      const file = path.join(dir, path.basename(u));
      if (fs.existsSync(file)) return;

      const res = await fetch(u);
      if (!res.ok) { console.warn(`  • skip ${u}`); return; }
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }));
  }
}

/* ───── 2.  Parse → Map<policyArea, Set<subjectTerms>> ─────────────────── */
function collectSubjects(node, bucket) {
  if (node == null) return;
  if (typeof node === 'object') {
    const nameAttr = node['@_name'] ?? node['@_term'] ?? node['@_label'];
    const nameElem = typeof node.name === 'string' ? node.name : null;
    if (nameAttr) bucket.add(nameAttr);
    if (nameElem) bucket.add(nameElem);

    for (const v of Object.values(node)) collectSubjects(v, bucket);
  } else if (Array.isArray(node)) {
    node.forEach(child => collectSubjects(child, bucket));
  }
}

function buildMap() {
  const parser = new XMLParser({
    ignoreAttributes: false,
    transformTagName: t => t.toLowerCase()
  });
  const map = new Map();
  let parsed = 0, matched = 0;

  for (const file of globSync(`${DATA_DIR}/**/*.xml`)) {
    parsed++;
    const root = parser.parse(fs.readFileSync(file,'utf8')).billstatus;
    const paTag = root?.bill?.policyarea;
    const policy = typeof paTag === 'string'
                 ? paTag
                 : paTag?.['@_name'] ?? paTag?.name ?? null;
    if (!policy) continue;

    const subjRoot = root.bill?.subjects;
    if (!subjRoot) continue;

    const bucket = map.get(policy) ?? new Set();
    collectSubjects(subjRoot, bucket);
    if (bucket.size) { map.set(policy, bucket); matched++; }
  }

  console.log(`✓ parsed ${parsed} XMLs; subjects found in ${matched}`);

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      Object.fromEntries([...map].map(([k,v]) => [k,[...v].sort()])),
      null, 2
    )
  );
  console.log(`✅  ${OUT_FILE} written  (${map.size} policy areas)`);
}

/* ───── 3.  Run everything ─────────────────────────────────────────────── */
await downloadAll();
buildMap();
