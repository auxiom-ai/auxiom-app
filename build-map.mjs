/* build-map.mjs  – soft-cluster CRS subject terms around policy areas
 *
 * 1. downloads every real BILLSTATUS XML for the 119th Congress
 * 2. builds a subject × policy occurrence matrix
 * 3. discards subjects that appear on < MIN_SUPPORT bills
 * 4. assigns each remaining subject to every policy area that accounts for
 *    ≥ THRESHOLD × its max co-occurrence
 * 5. writes policy-subject-map-119.json   { policyArea: string[] }
 */

import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { globSync } from 'glob';

const CONGRESS   = 119;
const TYPES      = ['hr','s','hjres','sjres','hconres','sconres','hres','sres'];
const DATA_DIR   = `data-${CONGRESS}`;
const OUT_FILE   = `policy-subject-map-${CONGRESS}.json`;

const THRESHOLD  = 0.30;  // 30 % of a subject’s peak count → link
const MIN_SUPPORT = 5;    // NEW: ignore subjects seen on fewer bills

/* ─────────────── 1.  download XMLs (via sitemap) ──────────────── */
async function downloadAll () {
  for (const t of TYPES) {
    const dir = path.join(DATA_DIR, t);
    fs.mkdirSync(dir, { recursive: true });

    const sitemap = `https://www.govinfo.gov/sitemap/bulkdata/BILLSTATUS/${CONGRESS}${t}/sitemap.xml`;
    const idxXML  = await fetch(sitemap).then(r => (r.ok ? r.text() : ''));
    if (!idxXML) { console.warn(`⚠️  no sitemap for ${t}`); continue; }

    const urls = [...idxXML.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map(m => m[1]);
    console.log(`⏬  ${t.padEnd(6)} – ${urls.length} files`);

    await Promise.all(urls.map(async url => {
      const dst = path.join(dir, path.basename(url));
      if (fs.existsSync(dst)) return;
      const r = await fetch(url);
      if (r.ok) fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer()));
    }));
  }
}

/* ─────────────── 2.  helper to harvest every <… name="…"> ─────── */
function extractTerms(node, bag) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach(n => extractTerms(n, bag));

  if (typeof node === 'object') {
    const attr = node['@_name'] ?? node['@_term'] ?? node['@_label'];
    const elem = typeof node.name === 'string' ? node.name : null;
    if (attr) bag.add(attr);
    if (elem) bag.add(elem);
    Object.values(node).forEach(v => extractTerms(v, bag));
  }
}

/* ─────────────── 3.  build occurrence matrices ────────────────── */
function buildMatrices() {
  const parser = new XMLParser({ ignoreAttributes:false,
                                 transformTagName:t=>t.toLowerCase() });

  const p2s = new Map();   // Map<policy, Map<subject,count>>
  const s2p = new Map();   // Map<subject, Map<policy,count>>

  let files = 0, termHits = 0;

  for (const f of globSync(`${DATA_DIR}/**/*.xml`)) {
    files++;
    const root = parser.parse(fs.readFileSync(f,'utf8')).billstatus;
    const paTag = root?.bill?.policyarea;
    const policy = typeof paTag === 'string'
                 ? paTag
                 : paTag?.['@_name'] ?? paTag?.name;
    if (!policy) continue;

    const bag = new Set();
    extractTerms(root.bill?.subjects, bag);
    if (!bag.size) continue;

    bag.forEach(term => {
      // policy → subject
      const subMap = p2s.get(policy) ?? new Map();
      subMap.set(term, (subMap.get(term) ?? 0) + 1);
      p2s.set(policy, subMap);

      // subject → policy
      const polMap = s2p.get(term) ?? new Map();
      polMap.set(policy, (polMap.get(policy) ?? 0) + 1);
      s2p.set(term, polMap);

      termHits++;
    });
  }
  console.log(`✓ parsed ${files} files, harvested ${termHits} term-hits`);
  return { p2s, s2p };
}

/* ─────────────── 4.  filter + soft-cluster ─────────────────────── */
function buildClusters(p2s, s2p) {
  const clusters = new Map([...p2s.keys()].map(pa => [pa, new Set()]));

  for (const [term, polMap] of s2p) {
    // total support across ALL policy areas
    const total = [...polMap.values()].reduce((a,b) => a+b, 0);
    if (total < MIN_SUPPORT) continue;          // NEW: support filter

    const max = Math.max(...polMap.values());
    for (const [policy, cnt] of polMap) {
      if (cnt >= max * THRESHOLD) clusters.get(policy).add(term);
    }
  }
  return clusters;
}

/* ─────────────── 5.  run pipeline ──────────────────────────────── */
await downloadAll();
const { p2s, s2p } = buildMatrices();
const clusters     = buildClusters(p2s, s2p);

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    Object.fromEntries(
      [...clusters].map(([k, set]) => [k, [...set].sort()])
    ),
    null, 2
  )
);
console.log(`✅  ${OUT_FILE} written  (${clusters.size} policy areas)`);

